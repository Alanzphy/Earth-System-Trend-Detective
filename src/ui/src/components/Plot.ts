import Plotly from "plotly.js-basic-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";

// Basic bundle (scatter, bar, pie) instead of full plotly.js: a fraction of the size.
export const Plot = createPlotlyComponent(Plotly);
