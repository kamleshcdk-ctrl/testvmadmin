
export function useFormkitStyles() {
  const formTextStyles = {
    outer: 'mb-5',
    label: 'block mb-1 font-bold text-sm text-surface-700 dark:text-surface-200',
    inner: 'max-w-md border border-gray-400 rounded-lg mb-1 overflow-hidden focus-within:border-primary-500',
    input: 'w-full h-10 px-3 border-none text-base text-surface-700 dark:text-surface-200 placeholder-gray-400',
    help: 'text-xs text-gray-500',
    message: 'text-red-500 mb-1 text-xs',
    messages: 'list-none p-0 mt-1 mb-0',

  }

  const formCheckboxStyles = {
    outer: 'flex items-center space-x-3 mb-5',
    input: 'accent-primary-500 text-primary-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600',
    label: 'ml-3 text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-surface-700 dark:text-surface-200',
    help: 'text-xs text-gray-500'
  }

  // https://formkit.com/inputs/form#provided-submit-button#provided-submit-button
  const formPrimarySubmitAttrs = { // used with <Form :submit-attrs=''/>
    // wrapperClass: '',
    inputClass: 'bg-primary-500 hover:bg-primary-700 text-surface-900 text-sm' +
      'font-bold py-2 px-3 rounded-lg formkit-disabled:opacity-50 formkit-loading:cursor-not-allowed',
    ignore: false
  }

  const formPrimaryButtonStyles = {
    outer: 'flex items-center space-x-3 mb-5',
    input: 'bg-primary-500 hover:bg-primary-700 text-surface-900 text-sm' +
      'font-bold py-2 px-3 rounded-lg formkit-disabled:opacity-50 formkit-loading:cursor-not-allowed',
    label: 'ml-3 text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-surface-700 dark:text-surface-200',
    help: 'text-xs text-gray-500'
  }
  const formSecondaryButtonStyles = {
    outer: 'flex items-center space-x-3 mb-5',
    input: 'bg-surface-500 hover:bg-surface-300 text-surface-900 text-sm' +
      'font-bold py-2 px-3 rounded-lg formkit-disabled:opacity-50 formkit-loading:cursor-not-allowed',
    label: 'ml-3 text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-surface-700 dark:text-surface-200',
    help: 'text-xs text-gray-500'
  }

  // Used for submit button layout area.
  //   'flex flex-1 flex-row-reverse' puts the submit button on the right side
  const formActionsAreaStyles = 'flex flex-1 flex-row-reverse'

  return {
    formTextStyles,
    formCheckboxStyles,
    formPrimarySubmitAttrs,
    formPrimaryButtonStyles,
    formSecondaryButtonStyles,
    formActionsAreaStyles
  }
}
