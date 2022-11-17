import GeoViewport from "@mapbox/geo-viewport";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const isMarker = (child) =>
  child &&
  child.props &&
  child.props.coordinate &&
  child.props.cluster !== false;

export const calculateBBox = (region) => {
  let lngD;
  if (region.longitudeDelta < 0) lngD = region.longitudeDelta + 360;
  else lngD = region.longitudeDelta;

  return [
    region.longitude - lngD, // westLng - min lng
    region.latitude - region.latitudeDelta, // southLat - min lat
    region.longitude + lngD, // eastLng - max lng
    region.latitude + region.latitudeDelta, // northLat - max lat
  ];
};

export const returnMapZoom = (region, bBox, minZoom) => {
  const viewport =
    region.longitudeDelta >= 40
      ? { zoom: minZoom }
      : GeoViewport.viewport(bBox, [width, height]);

  return viewport.zoom;
};

export const markerToGeoJSONFeature = (marker, index) => {
  return {
    type: "Feature",
    geometry: {
      coordinates: [
        marker.props.coordinate.longitude,
        marker.props.coordinate.latitude,
      ],
      type: "Point",
    },
    properties: {
      point_count: 0,
      index,
      ..._removeChildrenFromProps(marker.props),
    },
  };
};

export const generateSpiral = (marker, clusterChildren, markers, index) => {
  const { properties, geometry } = marker;
  const count = properties.point_count;
  const centerLocation = geometry.coordinates;

  let res = [];
  let angle = 0;
  let start = 0;

  for (let i = 0; i < index; i++) {
    start += markers[i].properties.point_count || 0;
  }

  for (let i = 0; i < count; i++) {
    angle = 0.25 * (i * 0.5);
    let latitude = centerLocation[1] + 0.0002 * angle * Math.cos(angle);
    let longitude = centerLocation[0] + 0.0002 * angle * Math.sin(angle);

    if (clusterChildren[i + start]) {
      res.push({
        index: clusterChildren[i + start].properties.index,
        longitude,
        latitude,
        centerPoint: {
          latitude: centerLocation[1],
          longitude: centerLocation[0],
        },
      });
    }
  }

  return res;
};

export const returnMarkerStyle = (points) => {
  if (points >= 1000) {
    return {
      width: 45,
      height: 45,
      size: 36,
      fontSize: 14,
    };
  }

  if (points >= 100) {
    return {
      width: 40,
      height: 40,
      size: 32,
      fontSize: 14,
    };
  }

  if (points >= 10) {
    return {
      width: 36,
      height: 36,
      size: 28,
      fontSize: 14,
    };
  }

  return {
    width: 30,
    height: 30,
    size: 22,
    fontSize: 14,
  };
};

const _removeChildrenFromProps = (props) => {
  const newProps = {};
  Object.keys(props).forEach((key) => {
    if (key !== "children") {
      newProps[key] = props[key];
    }
  });
  return newProps;
};
