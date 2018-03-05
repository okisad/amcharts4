var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { XYCursor } from "./XYCursor";
import { percent } from "../../core/utils/Percent";
import { system } from "../../core/System";
import * as $path from "../../core/rendering/Path";
import * as $math from "../../core/utils/Math";
import * as $utils from "../../core/utils/Utils";
/**
 * ============================================================================
 * MAIN CLASS
 * ============================================================================
 * @hidden
 */
/**
 * Cursor for [[RadarChart]].
 *
 * @see {@link IRadarCursorEvents} for a list of available events
 * @see {@link IRadarCursorAdapters} for a list of available Adapters
 */
var RadarCursor = /** @class */ (function (_super) {
    __extends(RadarCursor, _super);
    /**
     * Constructor
     */
    function RadarCursor() {
        var _this = 
        // Init
        _super.call(this) || this;
        _this.className = "RadarCursor";
        _this.radius = percent(100);
        _this.innerRadius = percent(0);
        // Apply theme
        _this.applyTheme();
        return _this;
    }
    /**
     * Checks if point is within bounds of a container.
     *
     * @ignore Exclude from docs
     * @param  {IPoint}   point  Point to check
     * @return {boolean}         Fits within container?
     */
    RadarCursor.prototype.fitsToBounds = function (point) {
        var radius = $math.getDistance(point);
        if (radius <= this.truePixelRadius + 10) {
            return true;
        }
        return false;
    };
    Object.defineProperty(RadarCursor.prototype, "startAngle", {
        /**
         * @return {number} Start angle
         */
        get: function () {
            return this.getPropertyValue("startAngle");
        },
        /**
         * Starting angle of the cursor's radial line.
         *
         * @param {number} value Start angle
         */
        set: function (value) {
            this.setPropertyValue("startAngle", value, true);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadarCursor.prototype, "endAngle", {
        /**
         * @return {number} End angle
         */
        get: function () {
            return this.getPropertyValue("endAngle");
        },
        /**
         * End angle of the cursor's radial line.
         *
         * @param {number} value End angle
         */
        set: function (value) {
            this.setPropertyValue("endAngle", value, true);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Updates cursor's positions when the tracked coordinates change.
     *
     * @param {ISpriteEvents["track"]} event Event
     */
    RadarCursor.prototype.handleCursorMove = function (event) {
        _super.prototype.handleCursorMove.call(this, event);
        if (!this.xAxis || (this.xAxis && !this.xAxis.cursorTooltipEnabled)) {
            this.updateLineX(this.point);
        }
        if (!this.yAxis || (this.yAxis && !this.yAxis.cursorTooltipEnabled)) {
            this.updateLineY(this.point);
        }
        this.updateSelection();
    };
    /**
     * (Re)draws the horizontal (circular) cursor's line.
     *
     * @param {IPoint} point New target point
     */
    RadarCursor.prototype.updateLineX = function (point) {
        var radius = this.pixelRadius;
        if (radius > 0) {
            var innerRadius = this.pixelInnerRadius;
            var startAngle = this.startAngle;
            var endAngle = this.endAngle;
            var angle = $math.fitAngleToRange($math.getAngle(point), startAngle, endAngle);
            var path = void 0;
            this.lineX.moveTo({ x: 0, y: 0 });
            if (this.lineX && this.lineX.visible) {
                // fill
                if (this.xAxis && this.fullWidthXLine) {
                    var startPoint = this.xAxis.currentItemStartPoint;
                    var endPoint = this.xAxis.currentItemEndPoint;
                    if (startPoint && endPoint) {
                        var fillStartAngle = $math.fitAngleToRange($math.getAngle(startPoint), startAngle, endAngle);
                        var fillEndAngle = $math.fitAngleToRange($math.getAngle(endPoint), startAngle, endAngle);
                        var arc = fillEndAngle - fillStartAngle;
                        // clockwise
                        // this is needed, normalizeAngle doesn't solve it
                        if (startAngle < endAngle) {
                            if (arc < 0) {
                                arc += 360;
                            }
                        }
                        else {
                            if (arc > 0) {
                                arc -= 360;
                            }
                        }
                        angle -= arc / 2;
                        path = $path.moveTo({ x: innerRadius * $math.cos(angle), y: innerRadius * $math.sin(angle) })
                            + $path.lineTo({ x: radius * $math.cos(angle), y: radius * $math.sin(angle) })
                            + $path.arcTo(angle, arc, radius)
                            + $path.lineTo({ x: innerRadius * $math.cos(angle + arc), y: innerRadius * $math.sin(angle + arc) })
                            + $path.arcTo(angle + arc, -arc, innerRadius);
                    }
                }
                // line
                if (!path) {
                    path = $path.moveTo({ x: innerRadius * $math.cos(angle), y: innerRadius * $math.sin(angle) }) + $path.lineTo({ x: radius * $math.cos(angle), y: radius * $math.sin(angle) });
                }
                this.lineX.element.attr({ "d": path });
            }
        }
    };
    /**
     * (Re)draws the vertical (radial) cursor's line.
     *
     * @param {IPoint} point New target point
     */
    RadarCursor.prototype.updateLineY = function (point) {
        if (this.lineY && this.lineY.visible) {
            var startAngle = this.startAngle;
            var endAngle = this.endAngle;
            var truePixelRadius = this.truePixelRadius;
            var radius = $math.fitToRange($math.getDistance(point), 0, this.truePixelRadius);
            this.lineY.moveTo({ x: 0, y: 0 });
            var path = void 0;
            var arc = endAngle - startAngle;
            if (this.yAxis && this.fullWidthYLine) {
                // fill
                var startPoint = this.yAxis.currentItemStartPoint;
                var endPoint = this.yAxis.currentItemEndPoint;
                if (startPoint && endPoint) {
                    var innerRadius = $math.fitToRange($math.getDistance(startPoint), 0, truePixelRadius);
                    radius = $math.fitToRange($math.getDistance(endPoint), 0, truePixelRadius);
                    path = $path.moveTo({ x: radius * $math.cos(startAngle), y: radius * $math.sin(startAngle) }) + $path.arcTo(startAngle, arc, radius);
                    path += $path.moveTo({ x: innerRadius * $math.cos(endAngle), y: innerRadius * $math.sin(endAngle) }) + $path.arcTo(endAngle, -arc, innerRadius);
                }
            }
            if (!path) {
                path = $path.moveTo({ x: radius * $math.cos(startAngle), y: radius * $math.sin(startAngle) }) + $path.arcTo(startAngle, endAngle - startAngle, radius);
            }
            this.lineY.element.attr({ "d": path });
        }
    };
    /**
     * Updates selection dimensions on size change.
     *
     * @ignore Exclude from docs
     */
    RadarCursor.prototype.updateSelection = function () {
        if (this._usesSelection) {
            var downPoint = this.downPoint;
            if (downPoint) {
                var point = this.point;
                var radius = this.pixelRadius;
                var truePixelRadius = this.truePixelRadius;
                var innerRadius = this.pixelInnerRadius;
                var startAngle = Math.min(this.startAngle, this.endAngle);
                var endAngle = Math.max(this.startAngle, this.endAngle);
                var downAngle = $math.fitAngleToRange($math.getAngle(downPoint), startAngle, endAngle);
                var angle = $math.fitAngleToRange($math.getAngle(point), startAngle, endAngle);
                // crossed starting angle from right to left
                if (angle - this._prevAngle > (endAngle - startAngle) / 2) {
                    angle = startAngle;
                }
                // crossed starting angle from left to right
                if (this._prevAngle - angle > (endAngle - startAngle) / 2) {
                    angle = endAngle;
                }
                var downRadius = $math.getDistance(downPoint);
                if (downRadius < truePixelRadius) {
                    var currentRadius = $math.fitToRange($math.getDistance(point), 0, truePixelRadius);
                    this._prevAngle = angle;
                    var path = $path.moveTo({ x: 0, y: 0 });
                    var downSin = $math.sin(downAngle);
                    var downCos = $math.cos(downAngle);
                    var sin = $math.sin(angle);
                    var cos = $math.cos(angle);
                    var behavior = this.behavior;
                    if (behavior == "zoomX" || behavior == "selectX") {
                        path += $path.lineTo({ x: radius * downCos, y: radius * downSin }) + $path.arcTo(downAngle, angle - downAngle, radius) + $path.lineTo({ x: innerRadius * cos, y: innerRadius * sin }) + $path.arcTo(angle, downAngle - angle, innerRadius);
                    }
                    else if (behavior == "zoomY" || behavior == "selectY") {
                        path = $path.moveTo({ x: currentRadius * $math.cos(startAngle), y: currentRadius * $math.sin(startAngle) }) + $path.arcTo(startAngle, endAngle - startAngle, currentRadius) + $path.lineTo({ x: downRadius * $math.cos(endAngle), y: downRadius * $math.sin(endAngle) }) + $path.arcTo(endAngle, startAngle - endAngle, downRadius) + $path.closePath();
                    }
                    else if (behavior == "zoomXY") {
                        path = $path.moveTo({ x: currentRadius * $math.cos(downAngle), y: currentRadius * $math.sin(downAngle) }) + $path.arcTo(downAngle, angle - downAngle, currentRadius) + $path.lineTo({ x: downRadius * $math.cos(angle), y: downRadius * $math.sin(angle) }) + $path.arcTo(angle, downAngle - angle, downRadius) + $path.closePath();
                    }
                    this.selection.element.attr({ "d": path });
                }
                this.selection.moveTo({ x: 0, y: 0 });
            }
        }
    };
    /**
     * Updates cursors current positions.
     */
    RadarCursor.prototype.getPositions = function () {
        // positions are used by axes or series
        var chart = this.chart;
        if (chart) {
            var innerRadius = this.pixelInnerRadius;
            var radius = this.truePixelRadius - innerRadius;
            var startAngle = this.startAngle;
            var endAngle = this.endAngle;
            var angle = $math.fitAngleToRange($math.getAngle(this.point), startAngle, endAngle);
            var xPosition = ((angle - startAngle) / (endAngle - startAngle));
            this.xPosition = xPosition;
            this.yPosition = $math.fitToRange(($math.getDistance(this.point) - innerRadius) / radius, 0, 1);
        }
    };
    /**
     * Overriding inherited method, so that nothing happens when it's triggered.
     *
     * @ignore Exclude from docs
     */
    RadarCursor.prototype.updateDownPoint = function () { };
    /**
     * Updates Cursor's position when axis tooltip changes horizontal position.
     *
     * @param {ISpriteEvents["positionchanged"]} event Axis event
     */
    RadarCursor.prototype.handleXTooltipPosition = function (event) {
        if (this.xAxis.cursorTooltipEnabled) {
            var tooltip = this.xAxis.tooltip;
            this.updateLineX($utils.svgPointToSprite({ x: tooltip.pixelX, y: tooltip.pixelY }, this));
        }
    };
    /**
     * Updates Cursor's position when axis tooltip changes vertical position.
     *
     * @todo Description
     * @param {ISpriteEvents["positionchanged"]} event Axis event
     */
    RadarCursor.prototype.handleYTooltipPosition = function (event) {
        if (this.yAxis.cursorTooltipEnabled) {
            var tooltip = this.yAxis.tooltip;
            this.updateLineY($utils.svgPointToSprite({ x: tooltip.pixelX, y: tooltip.pixelY }, this));
        }
    };
    /**
     * [getRanges description]
     *
     * @todo Description
     */
    RadarCursor.prototype.getRanges = function () {
        var downPoint = this.downPoint;
        if (downPoint) {
            var upPoint = this.upPoint;
            var chart = this.chart;
            if (chart) {
                var radius = this.pixelRadius;
                var startAngle = this.startAngle;
                var endAngle = this.endAngle;
                var downAngle = $math.fitAngleToRange($math.getAngle(downPoint), this.startAngle, this.endAngle);
                var upAngle = $math.fitAngleToRange($math.getAngle(upPoint), this.startAngle, this.endAngle);
                var downRadius = $math.fitToRange($math.getDistance(downPoint), 0, radius);
                var upRadius = $math.fitToRange($math.getDistance(upPoint), 0, radius);
                var startX = 0;
                var endX = 1;
                var startY = 0;
                var endY = 1;
                var behavior = this.behavior;
                if (behavior == "zoomX" || behavior == "selectX" || behavior == "zoomXY" || behavior == "selectXY") {
                    var arc = endAngle - startAngle;
                    startX = $math.round((downAngle - startAngle) / arc, 5);
                    endX = $math.round((upAngle - startAngle) / arc, 5);
                }
                if (behavior == "zoomY" || behavior == "selectY" || behavior == "zoomXY" || behavior == "selectXY") {
                    startY = $math.round(downRadius / radius, 5);
                    endY = $math.round(upRadius / radius, 5);
                }
                this.xRange = { start: Math.min(startX, endX), end: Math.max(startX, endX) };
                this.yRange = { start: Math.min(startY, endY), end: Math.max(startY, endY) };
                if (this.behavior == "selectX" || this.behavior == "selectY" || this.behavior == "selectXY") {
                    // void
                }
                else {
                    this.selection.hide();
                }
            }
        }
    };
    /**
     * Overriding inherited method, so that nothing happens when `updateSize`
     * is triggered.
     *
     * RadarCursor is quite complicated and needs own sizing logic.
     *
     * @ignore Exclude from docs
     */
    RadarCursor.prototype.updateSize = function () { };
    Object.defineProperty(RadarCursor.prototype, "radius", {
        /**
         * @return {number} Outer radius
         */
        get: function () {
            return this.getPropertyValue("radius");
        },
        /**
         * Outer radius of the cursor's circular line.
         * Absolute (px) or relative ([[Percent]]).
         *
         * @param {number | Percent}  value  Outer radius
         */
        set: function (value) {
            this.setPropertyValue("radius", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadarCursor.prototype, "pixelRadius", {
        /**
         * Outer radius of the circular line in pixels.
         *
         * @return {number} Outer radius (px)
         * @readonly
         */
        get: function () {
            return $utils.relativeRadiusToValue(this.radius, this.truePixelRadius);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadarCursor.prototype, "truePixelRadius", {
        /**
         * [truePixelRadius description]
         *
         * @todo Description
         * @return {number} Outer radius (px)
         * @readonly
         */
        get: function () {
            return $utils.relativeToValue(percent(100), $math.min(this.innerWidth / 2, this.innerHeight / 2));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadarCursor.prototype, "innerRadius", {
        /**
         * @return {number} Inner radius
         */
        get: function () {
            return this.getPropertyValue("innerRadius");
        },
        /**
         * Inner radius of the cursor's circular line.
         * Absolute (px) or relative ([[Percent]]).
         *
         * @param {number | Percent}  value  Inner radius
         */
        set: function (value) {
            this.setPropertyValue("innerRadius", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadarCursor.prototype, "pixelInnerRadius", {
        /**
         * Inner radius of the circular line in pixels.
         *
         * @return {number} Inner radius (px)
         * @readonly
         */
        get: function () {
            return $utils.relativeRadiusToValue(this.innerRadius, this.truePixelRadius) || 0;
        },
        enumerable: true,
        configurable: true
    });
    return RadarCursor;
}(XYCursor));
export { RadarCursor };
/**
 * Register class in system, so that it can be instantiated using its name from
 * anywhere.
 *
 * @ignore
 */
system.registeredClasses["RadarCursor"] = RadarCursor;
//# sourceMappingURL=RadarCursor.js.map