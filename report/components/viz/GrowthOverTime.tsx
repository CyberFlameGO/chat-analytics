import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Root, Color, Label, p50 } from "@amcharts/amcharts5";
import {
    XYChart,
    DateAxis,
    ValueAxis,
    AxisRendererX,
    AxisRendererY,
    StepLineSeries,
    ColumnSeries,
    XYCursor,
    XYSeries,
} from "@amcharts/amcharts5/xy";

import { useDataProvider } from "@report/DataProvider";
import { TimelineStats } from "@pipeline/aggregate/blocks/Growth";
import { Themes } from "./AmCharts5";
import { TimeUnit } from "@amcharts/amcharts5/.internal/core/util/Time";

const GrowthOverTime = ({ data, options }: { data?: TimelineStats; options: number[] }) => {
    const dataProvider = useDataProvider();
    const chartDiv = useRef<HTMLDivElement>(null);

    const xAxisRef = useRef<DateAxis<any> | null>(null);
    const seriesRef = useRef<XYSeries | null>(null);

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, false)); // Do not animate!

        const chart = root.container.children.push(XYChart.new(root, {}));
        chart.zoomOutButton.set("forceHidden", true);

        const xAxis = chart.xAxes.push(
            DateAxis.new(root, {
                baseInterval: { timeUnit: "day", count: 1 },
                renderer: AxisRendererX.new(root, {}),
            })
        );
        const yAxis = chart.yAxes.push(
            ValueAxis.new(root, {
                renderer: AxisRendererY.new(root, {}),
            })
        );
        yAxis.children.unshift(
            Label.new(root, {
                rotation: -90,
                text: "Total authors",
                y: p50,
                centerX: p50,
            })
        );

        const stepSeries = chart.series.push(
            StepLineSeries.new(root, {
                valueXField: "ts",
                valueYField: "value",
                xAxis: xAxis,
                yAxis: yAxis,
                stroke: Color.fromHex(0x479adb),
                fill: Color.fromHex(0x479adb),
            })
        );
        stepSeries.strokes.template.setAll({
            visible: true,
            strokeWidth: 2,
            strokeOpacity: 0.8,
        });
        stepSeries.fills.template.setAll({
            visible: true,
            fillOpacity: 0.2,
        });

        xAxisRef.current = xAxis;
        seriesRef.current = stepSeries;

        const onZoom = () => xAxis.zoomToDates(dataProvider.getActiveStartDate(), dataProvider.getActiveEndDate(), 0);
        dataProvider.on("trigger-time", onZoom);
        // must wait to datavalidated before zooming
        seriesRef.current!.events.once("datavalidated", onZoom);

        return () => {
            dataProvider.off("trigger-time", onZoom);
            root.dispose();
            xAxisRef.current = null;
            seriesRef.current = null;
        };
    }, []);

    useLayoutEffect(() => {
        xAxisRef.current?.set("baseInterval", { timeUnit: ["day", "week", "month"][options[0]] as TimeUnit, count: 1 });
        if (data) {
            // TODO: update efficient
            seriesRef.current?.data.setAll(data.growth);
        }
    }, [seriesRef.current, data, options]);

    return (
        <div
            ref={chartDiv}
            style={{
                minHeight: 500,
                marginLeft: 5,
                marginBottom: 8,
            }}
        />
    );
};

export default GrowthOverTime;
