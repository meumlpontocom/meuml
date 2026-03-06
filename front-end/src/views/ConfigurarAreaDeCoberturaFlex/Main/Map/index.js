import React from "react";
import Col from "reactstrap/lib/Col";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Polygon,
} from "react-google-maps";

export default function Map({ col: { xs, sm, md, lg }, zones }) {
  const apiKey = process.env.REACT_APP_MAPS_API_KEY;
  const PolygonalDesign = () => {
    return zones.map((zone, polygonKey) => {
      return (
        <Polygon
          key={polygonKey}
          paths={zone.coordinates}
          defaultOptions={{
            strokeColor: "#0398fc",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#03adfc",
            fillOpacity: 0.35,
          }}
        />
      );
    });
  };

  const CovarageZoneMap = withScriptjs(
    withGoogleMap((props) => (
      <GoogleMap
        defaultZoom={10.5}
        defaultCenter={{ lng: -46.634114, lat: -23.587853 }}
      >
        {props.isPolygonShown && <PolygonalDesign />}
      </GoogleMap>
    ))
  );

  return (
    <Col xs={xs} sm={sm} md={md} lg={lg}>
      <CovarageZoneMap
        isPolygonShown
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing`}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `400px` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    </Col>
  );
}
