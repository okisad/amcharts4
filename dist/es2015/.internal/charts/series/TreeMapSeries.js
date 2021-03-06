/**
 * TreeMap series module.
 */
import * as tslib_1 from "tslib";
/**
 * ============================================================================
 * IMPORTS
 * ============================================================================
 * @hidden
 */
import { ColumnSeries, ColumnSeriesDataItem } from "./ColumnSeries";
import { visualProperties } from "../../core/Sprite";
import { registry } from "../../core/Registry";
import { InterfaceColorSet } from "../../core/utils/InterfaceColorSet";
import * as $type from "../../core/utils/Type";
import { RoundedRectangle } from "../../core/elements/RoundedRectangle";
import * as $object from "../../core/utils/Object";
/**
 * ============================================================================
 * DATA ITEM
 * ============================================================================
 * @hidden
 */
/**
 * Defines a [[DataItem]] for [[TreeMapSeries]].
 *
 * @see {@link DataItem}
 */
var TreeMapSeriesDataItem = /** @class */ (function (_super) {
    tslib_1.__extends(TreeMapSeriesDataItem, _super);
    /**
     * Constructor
     */
    function TreeMapSeriesDataItem() {
        var _this = _super.call(this) || this;
        _this.className = "TreeMapSeriesDataItem";
        _this.applyTheme();
        return _this;
    }
    Object.defineProperty(TreeMapSeriesDataItem.prototype, "parentName", {
        /**
         * Data for the this particular item.
         *
         * @param {Object}  value  Item's data
         */
        //public set dataContext(value: Object) {
        //	this._dataContext = value;
        //}
        /**
         * @return {Object} Item's data
         */
        /*
       public get dataContext(): Object {
           // It's because data of tree series is TreeMapDataItems.
           if (this._dataContext) {
               return (<any>this._dataContext).dataContext;
           }
       }*/
        /**
         * The name of the item's parent item.
         *
         * @return {string} Parent name
         */
        get: function () {
            var treeMapDataItem = this.treeMapDataItem;
            if (treeMapDataItem && treeMapDataItem.parent) {
                return treeMapDataItem.parent.name;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeMapSeriesDataItem.prototype, "value", {
        /**
         * Item's numeric value.
         *
         * @readonly
         * @return {number} Value
         */
        get: function () {
            return this.treeMapDataItem.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeMapSeriesDataItem.prototype, "treeMapDataItem", {
        /**
         * A corresponding data item from the tree map.
         *
         * @readonly
         * @return {TreeMapDataItem} Data item
         */
        get: function () {
            return this._dataContext;
        },
        enumerable: true,
        configurable: true
    });
    return TreeMapSeriesDataItem;
}(ColumnSeriesDataItem));
export { TreeMapSeriesDataItem };
/**
 * ============================================================================
 * MAIN CLASS
 * ============================================================================
 * @hidden
 */
/**
 * Defines Series for a TreeMap chart.
 *
 * @see {@link ITreeMapSeriesEvents} for a list of available Events
 * @see {@link ITreeMapSeriesAdapters} for a list of available Adapters
 * @todo Example
 * @important
 */
var TreeMapSeries = /** @class */ (function (_super) {
    tslib_1.__extends(TreeMapSeries, _super);
    /**
     * Constructor
     */
    function TreeMapSeries() {
        var _this = _super.call(this) || this;
        _this.className = "TreeMapSeries";
        _this.applyTheme();
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.minBulletDistance = 0;
        _this.columns.template.tooltipText = "{parentName} {name}: {value}"; //@todo add format number?
        _this.columns.template.configField = "config";
        var interfaceColors = new InterfaceColorSet();
        _this.stroke = interfaceColors.getFor("background");
        _this.dataFields.openValueX = "x0";
        _this.dataFields.valueX = "x1";
        _this.dataFields.openValueY = "y0";
        _this.dataFields.valueY = "y1";
        _this.sequencedInterpolation = false;
        _this.showOnInit = false;
        // otherwise nodes don't stack nicely to each other
        _this.columns.template.pixelPerfect = false;
        return _this;
    }
    /**
     * Processes data item.
     *
     * @param {TreeMapSeriesDataItem}  dataItem     Data item
     * @param {Object}                 dataContext  Raw data
     * @param {number}                 index        Index of the data item
     */
    TreeMapSeries.prototype.processDataItem = function (dataItem, dataContext) {
        dataContext.seriesDataItem = dataItem; // save a reference here. dataContext is TreeMapDataItem and we need to know dataItem sometimes
        _super.prototype.processDataItem.call(this, dataItem, dataContext);
    };
    /**
     * Returns a new/empty DataItem of the type appropriate for this object.
     *
     * @see {@link DataItem}
     * @return {TreeMapSeriesDataItem} Data Item
     */
    TreeMapSeries.prototype.createDataItem = function () {
        return new TreeMapSeriesDataItem();
    };
    /**
     * Shows series.
     *
     * @param  {number}     duration  Duration of fade in (ms)
     * @return {Animation}            Animation
     */
    TreeMapSeries.prototype.show = function (duration) {
        var interpolationDuration = this.defaultState.transitionDuration;
        if ($type.isNumber(duration)) {
            interpolationDuration = duration;
        }
        this.dataItems.each(function (dataItem) {
            dataItem.treeMapDataItem.setWorkingValue("value", dataItem.treeMapDataItem.values.value.value);
        });
        var animation = _super.prototype.showReal.call(this, interpolationDuration);
        var chart = this.chart;
        if (chart) {
            if (animation && !animation.isFinished()) {
                animation.events.on("animationended", function () {
                    chart.invalidateLayout();
                });
            }
            else {
                chart.invalidateLayout();
            }
            chart.invalidateLayout();
        }
        return animation;
    };
    /**
     * Hides series.
     *
     * @param  {number}     duration  Duration of fade out (ms)
     * @return {Animation}            Animation
     */
    TreeMapSeries.prototype.hide = function (duration) {
        var interpolationDuration = this.defaultState.transitionDuration;
        if ($type.isNumber(duration)) {
            interpolationDuration = duration;
        }
        var animation = _super.prototype.hideReal.call(this, interpolationDuration);
        this.dataItems.each(function (dataItem) {
            dataItem.treeMapDataItem.setWorkingValue("value", 0);
        });
        var chart = this.chart;
        if (chart) {
            if (animation && !animation.isFinished()) {
                animation.events.on("animationended", function () {
                    chart.invalidateLayout();
                });
            }
            else {
                chart.invalidateLayout();
            }
            chart.invalidateLayout();
        }
        return animation;
    };
    /**
     * Process values.
     *
     * @ignore Exclude from docs
     */
    TreeMapSeries.prototype.processValues = function () {
        // Just overriding so that inherited method does not kick in.
    };
    /**
     * @ignore
     */
    TreeMapSeries.prototype.dataChangeUpdate = function () {
    };
    /**
     * Processes JSON-based config before it is applied to the object.
     *
     * @ignore Exclude from docs
     * @param {object}  config  Config
     */
    TreeMapSeries.prototype.processConfig = function (config) {
        if (config) {
            // Add empty data fields if the they are not set, so that XYSeries
            // dataField check does not result in error.
            if (!$type.hasValue(config.dataFields) || !$type.isObject(config.dataFields)) {
                config.dataFields = {};
            }
        }
        _super.prototype.processConfig.call(this, config);
    };
    /**
     * Creates elements in related legend container, that mimics the look of this
     * Series.
     *
     * @ignore Exclude from docs
     * @param {Container}  marker  Legend item container
     */
    TreeMapSeries.prototype.createLegendMarker = function (marker) {
        var w = marker.pixelWidth;
        var h = marker.pixelHeight;
        marker.removeChildren();
        var column = marker.createChild(RoundedRectangle);
        column.shouldClone = false;
        $object.copyProperties(this, column, visualProperties);
        //column.copyFrom(<any>this.columns.template);
        column.padding(0, 0, 0, 0); // if columns will have padding (which is often), legend marker will be very narrow
        column.width = w;
        column.height = h;
        var legendDataItem = marker.dataItem;
        legendDataItem.color = column.fill;
        legendDataItem.colorOrig = column.fill;
    };
    return TreeMapSeries;
}(ColumnSeries));
export { TreeMapSeries };
/**
 * Register class in system, so that it can be instantiated using its name from
 * anywhere.
 *
 * @ignore
 */
registry.registeredClasses["TreeMapSeries"] = TreeMapSeries;
registry.registeredClasses["TreeMapSeriesDataItem"] = TreeMapSeriesDataItem;
//# sourceMappingURL=TreeMapSeries.js.map