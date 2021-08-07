import {
  defineComponent,
  h,
  ref,
  onUnmounted,
  onMounted,
  provide,
  reactive,
  toRefs,
  watch,
} from 'vue'
import { createPopper } from '@popperjs/core'

const CDropdown = defineComponent({
  name: 'CDropdown',
  props: {
    /**
     * @values { 'start' | 'end' | { xs: 'start' | 'end' } | { sm: 'start' | 'end' } | { md: 'start' | 'end' } | { lg: 'start' | 'end' } | { xl: 'start' | 'end'} | { xxl: 'start' | 'end'} }
     */
    alignment: {
      type: [String, Object],
      default: undefined,
      required: false,
      validator: (value: string | any) => {
        if (value === 'start' || value === 'end') {
          return true
        } else {
          if (typeof value.xs !== 'undefined' && (value.xs === 'start' || value.xs === 'end')) {
            return true
          }
          if (typeof value.sm !== 'undefined' && (value.sm === 'start' || value.sm === 'end')) {
            return true
          }
          if (typeof value.md !== 'undefined' && (value.md === 'start' || value.md === 'end')) {
            return true
          }
          if (typeof value.lg !== 'undefined' && (value.lg === 'start' || value.lg === 'end')) {
            return true
          }
          if (typeof value.xl !== 'undefined' && (value.xl === 'start' || value.xl === 'end')) {
            return true
          }
          if (typeof value.xxl !== 'undefined' && (value.xxl === 'start' || value.xxl === 'end')) {
            return true
          }
          return false
        }
      },
    },
    /**
     * Enables pseudo element caret on toggler.
     *
     * @default true
     */
    caret: {
      type: Boolean,
      required: false,
      default: true,
    },
    /**
     * Sets a darker color scheme to match a dark navbar.
     */
    dark: {
      type: Boolean,
      required: false,
    },

    /**
     * Sets a specified  direction and location of the dropdown menu.
     *
     * @values 'dropup' | 'dropend' | 'dropstart'
     */
    direction: {
      type: String,
      default: undefined,
      required: false,
      validator: (value: string) => {
        return ['dropup', 'dropend', 'dropstart'].includes(value)
      },
    },
    /**
     * Toggle the disabled state for the component.
     */
    disabled: {
      type: Boolean,
      required: false,
    },
    /**
     * Describes the placement of your component after Popper.js has applied all the modifiers that may have flipped or altered the originally provided placement property.
     *
     * @values 'auto' | 'top-end' | 'top' | 'top-start' | 'bottom-end' | 'bottom' | 'bottom-start' | 'right-start' | 'right' | 'right-end' | 'left-start' | 'left' | 'left-end'
     * @default 'bottom-start'
     */
    placement: {
      type: String,
      default: 'bottom-start',
      required: false,
      validator: (value: string) => {
        // The value must match one of these strings
        return [
          'auto',
          'auto-start',
          'auto-end',
          'top-end',
          'top',
          'top-start',
          'bottom-end',
          'bottom',
          'bottom-start',
          'right-start',
          'right',
          'right-end',
          'left-start',
          'left',
          'left-end',
        ].includes(value)
      },
    },
    /**
     * If you want to disable dynamic positioning set this property to `true`.
     */
    popper: {
      type: Boolean,
      default: true,
      required: false,
    },
    /**
     * Sets which event handlers you’d like provided to your toggle prop. You can specify one trigger or an array of them.
     */
    trigger: {
      type: [String, Array],
      required: false,
      default: 'click',
    },
    /**
     * Set the dropdown variant to an btn-group, dropdown, input-group, and nav-item.
     */
    variant: {
      type: String,
      default: 'btn-group',
      required: false,
      validator: (value: string) => {
        return ['btn-group', 'dropdown', 'input-group', 'nav-item'].includes(value)
      },
    },
    /**
     * Toggle the visibility of dropdown menu component.
     *
     * @default false
     */
    visible: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, { slots }) {
    const dropdownRef = ref(null)
    const dropdownMenuRef = ref(null)
    const placement = ref(props.placement)
    const popper = ref()
    // const visible = ref()

    const config = reactive({
      alignment: props.alignment,
      dark: props.dark,
      popper: props.popper,
      visible: props.visible,
    })

    const { visible } = toRefs(config)

    provide('config', config)

    provide('variant', props.variant)
    provide('visible', visible)
    provide('dropdownRef', dropdownRef)
    provide('dropdownMenuRef', dropdownMenuRef)

    if (props.direction === 'dropup') {
      placement.value = 'top-start'
    }
    if (props.direction === 'dropend') {
      placement.value = 'right-start'
    }
    if (props.direction === 'dropstart') {
      placement.value = 'left-start'
    }
    if (props.alignment === 'end') {
      placement.value = 'bottom-end'
    }

    const initPopper = () => {
      // Disable popper if responsive aligment is set.
      if (typeof props.alignment === 'object') {
        return
      }

      if (dropdownRef.value) {
        // @ts-expect-error TODO: find solution
        popper.value = createPopper(dropdownRef.value, dropdownMenuRef.value, {
          placement: placement.value,
        })
      }
    }

    const destroyPopper = () => {
      if (popper.value) {
        popper.value.destroy()
      }
      popper.value = undefined
    }

    // const togglePopper = () => {
    //   visible.value ? initPopper() : destroyPopper()
    // }

    const toggleMenu = function () {
      if (props.disabled === false) {
        if (visible.value === true) {
          visible.value = false
        } else {
          visible.value = true
        }
      }
    }

    provide('toggleMenu', toggleMenu)

    const hideMenu = function () {
      if (props.disabled === false) {
        visible.value = false
      }
    }

    const handleKeyup = (event: Event) => {
      // @ts-expect-error TODO: find solution
      if (dropdownRef.value && !dropdownRef.value.contains(event.target as HTMLElement)) {
        hideMenu()
      }
    }
    const handleClickOutside = (event: Event) => {
      // @ts-expect-error TODO: find solution
      if (dropdownRef.value && !dropdownRef.value.contains(event.target as HTMLElement)) {
        hideMenu()
      }
    }

    onMounted(() => {
      window.addEventListener('click', handleClickOutside)
      window.addEventListener('keyup', handleKeyup)
    })
    onUnmounted(() => {
      window.removeEventListener('click', handleClickOutside)
      window.removeEventListener('keyup', handleKeyup)
    })

    watch(visible, () => props.popper && (visible.value ? initPopper() : destroyPopper()))

    return () =>
      props.variant === 'input-group'
        ? [slots.default && slots.default()]
        : h(
            'div',
            {
              class: [
                props.variant === 'nav-item' ? 'nav-item dropdown' : props.variant,
                props.direction,
              ],
            },
            slots.default && slots.default(),
          )
  },
})

export { CDropdown }