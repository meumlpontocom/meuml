import React from "react";
import "./style.css";

const SkeletonBase = ({ type, width, height, style }) => {
  const classes = `skeleton ${type}`;
  return <div className={classes} style={{ width, height, ...style }}></div>;
};

const SkeletonText = ({ width = "100%" }) => <SkeletonBase type="skeleton-text" width={width} />;

const SkeletonAvatar = ({ size = 50 }) => <SkeletonBase type="skeleton-avatar" width={size} height={size} />;

const SkeletonLine = ({ width, height, style }) => (
  <SkeletonBase type="skeleton-text" width={width} height={height} style={style} />
);

const Skeleton = ({ children }) => {
  return <div>{children}</div>;
};

Skeleton.Text = SkeletonText;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Line = SkeletonLine;

export default Skeleton;
