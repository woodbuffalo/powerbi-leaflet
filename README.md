# PowerBI Leaflet

## Background
PowerBI is a analytics and reporting tool owned by Microsoft. It integrates
data sources and BI tools in a browser or desktop based application.

PowerBI's integrated visualizations have limited capacity to visualize spatial
data. By default, Bing is the basemap provider, and the ability to style
spatial data by its attributes is very limited.

**PowerBI Leaflet** is a PowerBI visualization extension that uses leaflet for
enhanced spatial data visualization. Its goal is to

- support custom base imagery (i.e. pictometry),
- allow to style point data using a category to color mapping
- have custom tables displayed when mapped locations are clicked

## Usage

To use PowerBI Leaflet, import the visualization into PowerBI as described
[here](https://app.powerbi.com/visuals/info#use)

(Add additional details when visualization complete, e.g. build the
visualization as described below or download it from somewhere, and how to
adjust options)

## Development
### Getting Started
To develop the PowerBI Leaflet visualization, setup powerbi-visuals-tools as
described [here](https://github.com/microsoft/powerbi-visuals-docs). The steps
are summarized below:

1. clone this repo
2. Use Node 6
   - `nvm use 6`
2. install modules
   - `npm i`
3. setup ssl certs as describere
[here](https://github.com/Microsoft/PowerBI-visuals-docs/blob/master/tools/CertificateSetup.md)
4. setup powerbi cloud for development by
[enabling developer mode in settings](https://github.com/Microsoft/PowerBI-visuals-docs/blob/master/tools/DebugVisualSetup.md)
5. serve the visualization
   - `npm start`
6. [add the development visualization to your report](https://github.com/Microsoft/PowerBI-visuals-docs/blob/master/tools/DebugVisualSetup.md#step-3)
   and enable live reload to see your source changes immediately reflected in the application

### PowerBI Visualization Structure

It is useful to review
[the structure of a PowerBI Visualization Project](https://github.com/Microsoft/PowerBI-visuals-docs/blob/master/VisualProject.md) before getting started.

https://github.com/Microsoft/PowerBI-visuals-docs/blob/master/VisualProject.md

### Packaging the Visualization

`npm run package` will build the visualization into a `.pbiviz` file which can
be distributed and imported to any PowerBI account as a custom visualization.
