type Procedure = (...args: any[]) => void;

interface DebounceOptions {
   immediate?: boolean;
}

export const debounce = <T extends Procedure>(
   callback: T,
   delay: number,
   options: DebounceOptions = {}
): (...args: Parameters<T>) => void => {
   let timer: ReturnType<typeof setTimeout> | null = null;
   const { immediate = false } = options;

   return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
      const context = this;

      const later = () => {
         timer = null;
         if (!immediate) {
            callback.apply(context, args);
         }
      };

      const callNow = immediate && !timer;

      if (timer) clearTimeout(timer);
      timer = setTimeout(later, delay);

      if (callNow) {
         callback.apply(context, args);
      }
   };
}
