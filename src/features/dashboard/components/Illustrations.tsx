import { Image } from "expo-image";

const leaves = require("../../../../assets/illustrations/leaves.svg");
const bulb = require("../../../../assets/illustrations/bulb.svg");
const trees = require("../../../../assets/illustrations/trees.svg");

export function LeavesIllustration({ width }: { width: number }) {
  return (
    <Image
      source={leaves}
      contentFit="contain"
      style={{ width, height: width * 0.6 }}
    />
  );
}

export function BulbIllustration({ size }: { size: number }) {
  return (
    <Image
      source={bulb}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}

export function TreesIllustration({ width }: { width: number }) {
  return (
    <Image
      source={trees}
      contentFit="contain"
      style={{ width, height: width * 0.62 }}
    />
  );
}
