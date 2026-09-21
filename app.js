(function () {
  "use strict";

  angular
    .module("sharePlateApp", [])
    .factory("StorageService", StorageService)
    .service("MatchingService", MatchingService)
    .filter("humanize", humanizeFilter)
    .filter("recordSearch", recordSearchFilter)
    .directive("statusPill", statusPillDirective)
    .directive("statCard", statCardDirective)
    .controller("MainController", MainController);

  function StorageService($window) {
    var STORAGE_KEY = "shareplate.demo.v1";

    return {
      load: load,
      save: save,
      clear: clear
    };

    function load() {
      try {
        var raw = $window.localStorage.getItem(STORAGE_KEY);
        return raw ? angular.fromJson(raw) : null;
      } catch (error) {
        return null;
      }
    }

    function save(data) {
      try {
        $window.localStorage.setItem(STORAGE_KEY, angular.toJson(data));
      } catch (error) {
        // The demo still works in memory when LocalStorage is unavailable.
      }
    }

    function clear() {
      try {
        $window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        // No-op: storage may be disabled by the browser.
      }
    }
  }

  function MatchingService() {
    this.rankMatches = rankMatches;
    this.bestMatch = bestMatch;

    function bestMatch(offer, needs) {
      var ranked = rankMatches(offer, needs);
      return ranked.length ? ranked[0] : null;
    }

    function rankMatches(offer, needs) {
      return needs
        .filter(function (need) {
          return need.status === "open" && isCompatible(offer, need);
        })
        .map(function (need) {
          return scoreMatch(offer, need);
        })
        .sort(function (a, b) {
          if (b.score !== a.score) {
            return b.score - a.score;
          }

          return urgencyWeight(b.need.urgency) - urgencyWeight(a.need.urgency);
        });
    }

    function isCompatible(offer, need) {
      if (offer.status !== "open") {
        return false;
      }

      if (offer.category !== need.category) {
        return false;
      }

      if (offer.requiresCold && !need.hasColdStorage) {
        return false;
      }

      return true;
    }

    function scoreMatch(offer, need) {
      var score = 40;
      var reasons = ["same food category"];

      if (offer.zone === need.zone) {
        score += 20;
        reasons.push("same service zone");
      } else {
        score += 8;
        reasons.push("different zone but still eligible");
      }

      var coverage = Math.min(offer.quantityKg, need.quantityKg) / Math.max(offer.quantityKg, need.quantityKg);
      score += Math.round(coverage * 20);

      if (coverage >= 0.8) {
        reasons.push("quantity closely fits the request");
      } else {
        reasons.push("partial quantity fit");
      }

      var urgencyPoints = {
        urgent: 12,
        high: 8,
        normal: 4
      };

      score += urgencyPoints[need.urgency] || 0;

      if (need.urgency === "urgent") {
        reasons.push("request is urgent");
      } else if (need.urgency === "high") {
        reasons.push("request is time-sensitive");
      }

      if (offer.requiresCold) {
        score += 8;
        reasons.push("cold-storage requirement is supported");
      } else {
        score += 8;
        reasons.push("no cold-chain constraint");
      }

      return {
        need: need,
        score: Math.min(score, 100),
        reason: sentence(reasons)
      };
    }

    function urgencyWeight(urgency) {
      return {
        urgent: 3,
        high: 2,
        normal: 1
      }[urgency] || 0;
    }

    function sentence(parts) {
      if (!parts.length) {
        return "";
      }

      var value = parts.join(", ");
      return value.charAt(0).toUpperCase() + value.slice(1) + ".";
    }
  }

  function humanizeFilter() {
    return function (value) {
      if (!value) {
        return "";
      }

      return String(value)
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, function (letter) {
          return letter.toUpperCase();
        });
    };
  }

  function recordSearchFilter() {
    return function (items, query) {
      if (!angular.isArray(items)) {
        return [];
      }

      if (!query) {
        return items;
      }

      var needle = String(query).toLowerCase().trim();

      return items.filter(function (item) {
        var searchable = [
          item.donorName,
          item.organization,
          item.category,
          item.zone,
          item.pickupWindow,
          item.urgency,
          item.notes,
          item.status,
          item.matchedWith
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.indexOf(needle) !== -1;
      });
    };
  }

  function statusPillDirective() {
    return {
      restrict: "E",
      scope: {
        status: "="
      },
      template:
        '<span class="status-pill" ng-class="\'status-\' + status">{{ status === "matched" ? "Matched" : "Open" }}</span>'
    };
  }

  function statCardDirective() {
    return {
      restrict: "E",
      scope: {
        label: "@",
        value: "=",
        suffix: "@"
      },
      template:
        '<div class="stat-card"><strong>{{ value | number:0 }}{{ suffix }}</strong><span>{{ label }}</span></div>'
    };
  }

  MainController.$inject = ["$timeout", "$window", "StorageService", "MatchingService"];

  function MainController($timeout, $window, StorageService, MatchingService) {
    var vm = this;

    vm.categories = [
      "Bakery",
      "Produce",
      "Prepared meals",
      "Pantry staples",
      "Dairy",
      "Mixed groceries"
    ];

    vm.zones = ["Central", "North", "South", "East", "West"];

    vm.activeView = "offers";
    vm.formMode = "offer";
    vm.searchText = "";
    vm.statusFilter = "";
    vm.toast = "";
    vm.offerForm = blankOffer();
    vm.needForm = blankNeed();

    vm.submitIntake = submitIntake;
    vm.confirmMatch = confirmMatch;
    vm.bestMatchFor = bestMatchFor;
    vm.resetDemo = resetDemo;
    vm.loadScenario = loadScenario;
    vm.scrollTo = scrollTo;

    initialize();

    function initialize() {
      var saved = StorageService.load();
      var data = saved || sampleData();

      vm.offers = data.offers || [];
      vm.needs = data.needs || [];

      refresh();
    }

    function blankOffer() {
      return {
        donorName: "",
        category: "",
        quantityKg: null,
        zone: "",
        pickupWindow: "",
        requiresCold: false,
        notes: ""
      };
    }

    function blankNeed() {
      return {
        organization: "",
        category: "",
        quantityKg: null,
        zone: "",
        urgency: "normal",
        hasColdStorage: false,
        notes: ""
      };
    }

    function submitIntake(form) {
      if (!form || form.$invalid) {
        showToast("Please complete the required fields before saving.");
        return;
      }

      if (vm.formMode === "offer") {
        vm.offers.unshift({
          id: createId("offer"),
          donorName: clean(vm.offerForm.donorName),
          category: vm.offerForm.category,
          quantityKg: Number(vm.offerForm.quantityKg),
          zone: vm.offerForm.zone,
          pickupWindow: vm.offerForm.pickupWindow,
          requiresCold: Boolean(vm.offerForm.requiresCold),
          notes: clean(vm.offerForm.notes),
          status: "open",
          matchedWith: "",
          matchedKg: 0,
          createdAt: new Date().toISOString()
        });

        vm.offerForm = blankOffer();
        vm.activeView = "offers";
        showToast("Surplus offer added. Matching suggestions have been refreshed.");
      } else {
        vm.needs.unshift({
          id: createId("need"),
          organization: clean(vm.needForm.organization),
          category: vm.needForm.category,
          quantityKg: Number(vm.needForm.quantityKg),
          zone: vm.needForm.zone,
          urgency: vm.needForm.urgency,
          hasColdStorage: Boolean(vm.needForm.hasColdStorage),
          notes: clean(vm.needForm.notes),
          status: "open",
          matchedWith: "",
          createdAt: new Date().toISOString()
        });

        vm.needForm = blankNeed();
        vm.activeView = "needs";
        showToast("Community need added. Open food offers can now be compared against it.");
      }

      form.$setPristine();
      form.$setUntouched();
      refresh();
    }

    function confirmMatch(offer, need) {
      if (!offer || !need || offer.status !== "open" || need.status !== "open") {
        showToast("That match is no longer available.");
        return;
      }

      var matchedKg = Math.min(Number(offer.quantityKg), Number(need.quantityKg));

      offer.status = "matched";
      offer.matchedWith = need.organization;
      offer.matchedKg = matchedKg;
      offer.matchedAt = new Date().toISOString();

      need.status = "matched";
      need.matchedWith = offer.donorName;
      need.matchedKg = matchedKg;
      need.matchedAt = offer.matchedAt;

      refresh();
      showToast("Handoff confirmed in the demo. " + matchedKg + " kg has been added to the impact estimate.");
    }

    function bestMatchFor(offer) {
      return MatchingService.bestMatch(offer, vm.needs);
    }

    function refresh() {
      vm.metrics = calculateMetrics();
      persist();
    }

    function calculateMetrics() {
      var matchedKg = vm.offers.reduce(function (total, offer) {
        return total + (Number(offer.matchedKg) || 0);
      }, 0);

      return {
        kgRescued: matchedKg,
        mealsSupported: Math.round(matchedKg * 2.2),
        co2Avoided: matchedKg * 2.5,
        openOffers: countByStatus(vm.offers, "open"),
        openNeeds: countByStatus(vm.needs, "open")
      };
    }

    function persist() {
      StorageService.save({
        offers: vm.offers,
        needs: vm.needs
      });
    }

    function countByStatus(items, status) {
      return items.filter(function (item) {
        return item.status === status;
      }).length;
    }

    function resetDemo() {
      StorageService.clear();
      var data = sampleData();
      vm.offers = data.offers;
      vm.needs = data.needs;
      vm.searchText = "";
      vm.statusFilter = "";
      vm.activeView = "offers";
      vm.formMode = "offer";
      vm.offerForm = blankOffer();
      vm.needForm = blankNeed();
      refresh();
      showToast("Demo data restored.");
    }

    function loadScenario() {
      vm.formMode = "offer";
      vm.activeView = "offers";
      vm.offerForm = {
        donorName: "Harbor Cafe",
        category: "Prepared meals",
        quantityKg: 24,
        zone: "Central",
        pickupWindow: "Within 2 hours",
        requiresCold: true,
        notes: "Individually packed meals prepared today; refrigerated pickup required."
      };

      scrollTo("workspace");
      showToast("Sample surplus scenario loaded. Review the fields, then add the offer.");
    }

    function scrollTo(id) {
      $timeout(function () {
        var element = $window.document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    }

    function showToast(message) {
      vm.toast = message;

      $timeout.cancel(vm.toastTimer);
      vm.toastTimer = $timeout(function () {
        vm.toast = "";
      }, 3500);
    }

    function createId(prefix) {
      var random = Math.random().toString(36).slice(2, 8);
      return prefix + "-" + Date.now().toString(36) + "-" + random;
    }

    function clean(value) {
      return String(value || "").trim();
    }

    function sampleData() {
      return {
        offers: [
          {
            id: "offer-sunrise",
            donorName: "Sunrise Bakery",
            category: "Bakery",
            quantityKg: 18,
            zone: "Central",
            pickupWindow: "Within 2 hours",
            requiresCold: false,
            notes: "Bread and rolls packed at closing time.",
            status: "open",
            matchedWith: "",
            matchedKg: 0,
            createdAt: "2026-09-21T09:00:00.000Z"
          },
          {
            id: "offer-greenmarket",
            donorName: "Green Market Cooperative",
            category: "Produce",
            quantityKg: 34,
            zone: "North",
            pickupWindow: "Today",
            requiresCold: false,
            notes: "Mixed vegetables suitable for same-day distribution.",
            status: "open",
            matchedWith: "",
            matchedKg: 0,
            createdAt: "2026-09-21T08:15:00.000Z"
          },
          {
            id: "offer-familygrocer",
            donorName: "Family Grocer",
            category: "Pantry staples",
            quantityKg: 22,
            zone: "South",
            pickupWindow: "Today",
            requiresCold: false,
            notes: "Rice, canned goods, and unopened dry goods.",
            status: "matched",
            matchedWith: "Southside Family Center",
            matchedKg: 22,
            matchedAt: "2026-09-21T07:45:00.000Z",
            createdAt: "2026-09-21T07:10:00.000Z"
          }
        ],
        needs: [
          {
            id: "need-hopekitchen",
            organization: "Hope Community Kitchen",
            category: "Bakery",
            quantityKg: 14,
            zone: "Central",
            urgency: "urgent",
            hasColdStorage: false,
            notes: "Serving an evening meal program for 80 residents.",
            status: "open",
            matchedWith: "",
            createdAt: "2026-09-21T08:30:00.000Z"
          },
          {
            id: "need-seniorcenter",
            organization: "Northside Senior Center",
            category: "Produce",
            quantityKg: 30,
            zone: "North",
            urgency: "high",
            hasColdStorage: true,
            notes: "Fresh-produce boxes for older residents.",
            status: "open",
            matchedWith: "",
            createdAt: "2026-09-21T08:00:00.000Z"
          },
          {
            id: "need-youthshelter",
            organization: "City Youth Shelter",
            category: "Prepared meals",
            quantityKg: 20,
            zone: "Central",
            urgency: "urgent",
            hasColdStorage: true,
            notes: "Dinner support requested for tonight.",
            status: "open",
            matchedWith: "",
            createdAt: "2026-09-21T07:55:00.000Z"
          },
          {
            id: "need-familycenter",
            organization: "Southside Family Center",
            category: "Pantry staples",
            quantityKg: 25,
            zone: "South",
            urgency: "high",
            hasColdStorage: false,
            notes: "Weekly grocery packs for local households.",
            status: "matched",
            matchedWith: "Family Grocer",
            matchedKg: 22,
            matchedAt: "2026-09-21T07:45:00.000Z",
            createdAt: "2026-09-21T07:20:00.000Z"
          }
        ]
      };
    }
  }
})();
