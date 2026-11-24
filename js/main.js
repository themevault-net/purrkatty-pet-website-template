/*
Template Name: PurrKatty
File Name: main.js
Author Name: ThemeVault
Author URI: https://www.themevault.net/
Version: 2.0

Dependency-free. Bootstrap's own bundle drives the navbar collapse and the
two carousels (the vertical banner and the testimonials); everything below
replaces what jQuery, custom.js and lightbox.js used to do. (banner-slider.js
and the Instagram feed shipped with v1 and ran against nothing; gone.)
*/
(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* Back to top — fades in past 100px, returns to the top (custom.js) */
    var toTop = document.getElementById("back-to-top");
    if (toTop) {
        var toggleToTop = function () { toTop.classList.toggle("is-visible", window.scrollY > 100); };
        toggleToTop();
        window.addEventListener("scroll", toggleToTop, { passive: true });
        toTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        });
    }


    /* Tapping a link in the collapsed menu closes it. Dropdown toggles are
       excluded: tapping Shop or Pages opens a submenu, it does not navigate. */
    var collapse = document.querySelector(".navbar-collapse");
    if (collapse) {
        collapse.addEventListener("click", function (e) {
            var link = e.target.closest("a");
            if (!link || link.classList.contains("dropdown-toggle") || link.classList.contains("dropbtn")) return;
            if (!collapse.classList.contains("show")) return;
            var inst = window.bootstrap && bootstrap.Collapse.getInstance(collapse);
            if (inst) inst.hide();
        });
    }


    /* Forms: validate, then say so — a static template posts nowhere. Every
       form that submits carries a .tv-form-note the porter added. */
    document.querySelectorAll("form").forEach(function (form) {
        var note = form.querySelector(".tv-form-note");
        if (!note) return;
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var ok = true;
            form.querySelectorAll("[required]").forEach(function (f) {
                var bad = !f.checkValidity();
                f.classList.toggle("is-invalid", bad);
                if (bad && ok) { f.focus(); ok = false; }
            });
            if (!ok) return;
            note.hidden = false; note.focus();
            form.reset();
        });
        form.querySelectorAll("[required]").forEach(function (f) {
            f.addEventListener("input", function () { if (f.checkValidity()) f.classList.remove("is-invalid"); });
        });
    });


    /* Lightbox — replaces magnific-popup on `[data-image-popup]` (lightbox.js's `data-lightbox` set): arrows and the keyboard step through
       the photos. Focus is trapped and restored. */
    var popupLinks = Array.prototype.slice.call(document.querySelectorAll("[data-image-popup]"));
    var videoBtn = document.getElementById("popup-youtube");
    if (popupLinks.length || videoBtn) {
        var box = document.createElement("div");
        box.className = "tv-lightbox";
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        box.setAttribute("aria-label", "Media viewer");
        box.innerHTML =
            '<button type="button" class="tv-lb-close" aria-label="Close">&times;</button>' +
            '<button type="button" class="tv-lb-prev" aria-label="Previous image">&#10094;</button>' +
            '<div class="tv-lb-stage"><img alt=""></div>' +
            '<button type="button" class="tv-lb-next" aria-label="Next image">&#10095;</button>';
        document.body.appendChild(box);
        var stage = box.querySelector(".tv-lb-stage"), lbImg = stage.querySelector("img"), current = 0, lastFocus = null;
        var arrows = [box.querySelector(".tv-lb-prev"), box.querySelector(".tv-lb-next")];
        var show = function (i) {
            current = (i + popupLinks.length) % popupLinks.length;
            var link = popupLinks[current];
            stage.innerHTML = ""; stage.appendChild(lbImg);
            lbImg.src = link.getAttribute("href");
            var inner = link.querySelector("img");
            lbImg.alt = (inner && inner.getAttribute("alt")) || "Gallery image";
            arrows.forEach(function (b) { b.hidden = popupLinks.length < 2; });
        };
        var showVideo = function (src) {
            stage.innerHTML = '<div class="tv-lb-video"><iframe src="' + src + '" title="Video" allow="autoplay; fullscreen" allowfullscreen></iframe></div>';
            arrows.forEach(function (b) { b.hidden = true; });
        };
        var open = function () {
            lastFocus = document.activeElement;
            box.classList.add("is-open"); document.body.style.overflow = "hidden";
            box.querySelector(".tv-lb-close").focus();
        };
        var close = function () {
            box.classList.remove("is-open"); document.body.style.overflow = "";
            stage.innerHTML = ""; stage.appendChild(lbImg); lbImg.removeAttribute("src");
            if (lastFocus) lastFocus.focus();
        };
        popupLinks.forEach(function (link, i) { link.addEventListener("click", function (e) { e.preventDefault(); show(i); open(); }); });
        if (videoBtn) videoBtn.addEventListener("click", function (e) { e.preventDefault(); showVideo(videoBtn.getAttribute("data-video")); open(); });
        box.querySelector(".tv-lb-close").addEventListener("click", close);
        arrows[0].addEventListener("click", function () { show(current - 1); });
        arrows[1].addEventListener("click", function () { show(current + 1); });
        box.addEventListener("click", function (e) { if (e.target === box) close(); });
        document.addEventListener("keydown", function (e) {
            if (!box.classList.contains("is-open")) return;
            if (e.key === "Escape") close();
            if (!arrows[0].hidden && e.key === "ArrowLeft") show(current - 1);
            if (!arrows[0].hidden && e.key === "ArrowRight") show(current + 1);
        });
    }


    /* The shop's category filter (shop.html, new): buttons carry
       data-filter, tiles carry data-category; "all" shows everything. */
    var shopFilter = document.querySelector(".tv-shop-filter");
    var shopGrid = document.querySelector(".tv-shop-grid");
    if (shopFilter && shopGrid) {
        shopFilter.addEventListener("click", function (e) {
            var btn = e.target.closest("button[data-filter]");
            if (!btn) return;
            var want = btn.getAttribute("data-filter");
            shopFilter.querySelectorAll("button").forEach(function (b) { b.classList.toggle("active", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
            shopGrid.querySelectorAll("[data-category]").forEach(function (tile) {
                tile.classList.toggle("is-filtered-out", want !== "all" && tile.getAttribute("data-category") !== want);
            });
        });
    }

    /* The booking page (booking.html, new): a package's Contact Us or a
       service's Book This arrives with the choice in the hash
       (booking.html#special) — preselect it. */
    var pkg = document.getElementById("bk-package");
    if (pkg && location.hash) {
        var opt = pkg.querySelector('option[value="' + location.hash.slice(1) + '"]');
        if (opt) opt.selected = true;
    }

})();
