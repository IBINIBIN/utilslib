import { ref, Ref, getCurrentInstance } from "vue";
import kebabCase from "lodash/kebabCase";

export function useVModel<T>(propName: string, value: Ref<T>, defaultValue?: any) {
  const { emit, vnode } = getCurrentInstance()!;
  const internalValue = ref<T>();

  const vProps = vnode.props || {};

  const isVMP =
    Object.prototype.hasOwnProperty.call(vProps, propName) ||
    Object.prototype.hasOwnProperty.call(vProps, kebabCase(propName));

  if (isVMP) {
    return [
      value,
      (newValue: T, ...args: any[]) => {
        emit(`update:${propName}`, newValue);
      },
    ];
  }

  internalValue.value = defaultValue;
  return [
    internalValue,
    (newValue: T) => {
      internalValue.value = newValue;
    },
  ];
}
