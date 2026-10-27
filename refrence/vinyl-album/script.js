/* =================================================================
   NIGHT SIGNALS — 3D vinyl album drag controller
   -----------------------------------------------------------------
   The whole-object Y rotation is held HERE in JS and written to
   .album's transform. The vinyl disc's continuous spin is a pure
   CSS @keyframes animation on .record-spin, completely independent
   of this — so dragging the album never interrupts the disc.
   ================================================================= */
(function () {
  "use strict";

  var stage = document.getElementById("stage");
  var album = document.getElementById("album");

  var INITIAL_YAW       = 22;    // degrees — matches the CSS fallback
  var DRAG_SENSITIVITY  = 0.4;   // degrees per pixel dragged

  var yaw  = INITIAL_YAW;
  var drag = null;               // { id, startX, startYaw } while dragging

  function render() {
    album.style.transform = "rotateY(" + yaw.toFixed(2) + "deg)";
  }

  /* ---------------------------- pointer -------------------------- */

  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startYaw: yaw
    };

    stage.classList.add("is-dragging");

    if (stage.setPointerCapture) {
      try { stage.setPointerCapture(event.pointerId); } catch (err) { /* ignore */ }
    }
    event.preventDefault();          // blocks text selection / native drag
  }

  function onPointerMove(event) {
    if (!drag || event.pointerId !== drag.id) return;

    var dx = event.clientX - drag.startX;
    yaw = drag.startYaw + dx * DRAG_SENSITIVITY;
    render();
  }

  function onPointerUp(event) {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null;
    stage.classList.remove("is-dragging");

    if (stage.releasePointerCapture && stage.hasPointerCapture &&
        stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
  }

  stage.addEventListener("pointerdown", onPointerDown);
  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerup", onPointerUp);
  stage.addEventListener("pointercancel", onPointerUp);
  stage.addEventListener("lostpointercapture", onPointerUp);
  stage.addEventListener("dragstart", function (e) { e.preventDefault(); });

  /* ---------------------------- init ----------------------------- */

  render();
})();