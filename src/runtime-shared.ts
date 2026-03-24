import type { ClassValue } from "./classname";
import { classify } from "./classname";

type ClassNameProps = {
  className?: ClassValue;
};

const hasOwn = (value: object, key: PropertyKey): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

export function resolveIntrinsicProps<T>(type: unknown, props: T): T {
  if (typeof type !== "string" || typeof props !== "object" || props === null) {
    return props;
  }

  if (!hasOwn(props, "className")) {
    return props;
  }

  const className = (props as ClassNameProps).className;

  if (typeof className === "string") {
    return props;
  }

  return {
    ...(props as Record<string, unknown>),
    className: classify(className),
  } as T;
}
