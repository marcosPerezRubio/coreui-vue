import { defineComponent, h, ref, RendererElement, Transition } from 'vue'

import { CBackdrop } from './../backdrop/CBackdrop'

const CModal = defineComponent({
  name: 'CModal',
  props: {
    /**
     * Align the modal in the center or top of the screen.
     *
     * @default 'top'
     * @values 'top', 'center'
     */
    alignment: {
      default: 'top',
      required: false,
      validator: (value: string) => {
        return ['top', 'center'].includes(value)
      },
    },
    /**
     * Apply a backdrop on body while offcanvas is open.
     *
     * @default true
     * @values boolean, 'static'
     */
    backdrop: {
      type: [Boolean, String],
      default: true,
      require: false,
    },
    /**
     * A string of all className you want applied to the modal content component.
     * TODO: Consider if we should change this prop name to describe better its role.
     */
    className: {
      type: String,
      default: undefined,
      required: false,
    },
    /**
     * Set modal to covers the entire user viewport
     *
     * @values boolean, 'sm', 'md', 'lg', 'xl', 'xxl'
     */
    fullscreen: {
      type: [Boolean, String],
      default: undefined,
      required: false,
      validator: (value: boolean | string) => {
        if (typeof value == 'string') {
          return ['sm', 'md', 'lg', 'xl', 'xxl'].includes(value)
        }
        if (typeof value == 'boolean') {
          return true
        }
        return false
      },
    },
    /**
     * Closes the modal when escape key is pressed.
     *
     * @default true
     */
    keyboard: {
      type: Boolean,
      default: true,
      required: false,
    },
    /**
     * Does the modal dialog itself scroll, or does the whole dialog scroll within the window.
     */
    dismiss: {
      type: Boolean,
      default: false,
      required: false,
    },
    /**
     * Create a scrollable modal that allows scrolling the modal body.
     */
    scrollable: {
      type: Boolean,
      required: false,
    },
    /**
     * Size the component small, large, or extra large.
     *
     * @values 'sm', 'lg', 'xl'
     */
    size: {
      type: String,
      default: undefined,
      required: false,
      validator: (value: string) => {
        return ['sm', 'lg', 'xl'].includes(value)
      },
    },
    /**
     * Remove animation to create modal that simply appear rather than fade in to view.
     */
    transition: {
      type: Boolean,
      default: true,
      required: false,
    },
    /**
     * Toggle the visibility of alert component.
     */
    visible: {
      type: Boolean,
      required: false,
    },
  },
  emits: [
    /**
     * Event called before the dissmiss animation has started.
     */
    'dismiss',
  ],
  setup(props, { slots, attrs, emit }) {
    const modalRef = ref()
    const modalContentRef = ref()
    const handleEnter = (el: RendererElement, done: () => void) => {
      el.addEventListener('transitionend', () => {
        done()
      })
      document.body.classList.add('modal-open')
      el.style.display = 'block'
      setTimeout(() => {
        el.classList.add('show')
      }, 1)
    }
    const handleAfterEnter = () => {
      window.addEventListener('click', handleClickOutside)
      window.addEventListener('keyup', handleKeyUp)
    }
    const handleLeave = (el: RendererElement, done: () => void) => {
      el.addEventListener('transitionend', () => {
        done()
      })
      document.body.classList.remove('modal-open')
      el.classList.remove('show')
    }
    const handleAfterLeave = (el: RendererElement) => {
      window.removeEventListener('click', handleClickOutside)
      window.removeEventListener('keyup', handleKeyUp)
      el.style.display = 'none'
    }

    const handleDismiss = () => {
      emit('dismiss')
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (
        modalContentRef.value &&
        !modalContentRef.value.contains(event.target as HTMLElement) &&
        props.backdrop !== 'static'
      ) {
        if (event.key === 'Escape' && props.keyboard) {
          return handleDismiss()
        }
      }
      if (props.backdrop === 'static') {
        modalRef.value.classList.add('modal-static')
        setTimeout(() => {
          modalRef.value.classList.remove('modal-static')
        }, 300)
      }
    }
    const handleClickOutside = (event: Event) => {
      if (
        modalContentRef.value &&
        !modalContentRef.value.contains(event.target as HTMLElement) &&
        props.backdrop !== 'static'
      ) {
        handleDismiss()
      }
      if (props.backdrop === 'static') {
        modalRef.value.classList.add('modal-static')
        setTimeout(() => {
          modalRef.value.classList.remove('modal-static')
        }, 300)
      }
    }

    return () => [
      h(
        Transition,
        {
          onEnter: (el, done) => handleEnter(el, done),
          onAfterEnter: () => handleAfterEnter(),
          onLeave: (el, done) => handleLeave(el, done),
          onAfterLeave: (el) => handleAfterLeave(el),
        },
        [
          props.visible &&
            h(
              'div',
              {
                class: [
                  'modal',
                  {
                    ['fade']: props.transition,
                  },
                  attrs.class,
                ],
                ref: modalRef,
              },
              h(
                'div',
                {
                  class: [
                    'modal-dialog',
                    {
                      'modal-dialog-centered': props.alignment === 'center',
                      [`modal-fullscreen-${props.fullscreen}-down`]:
                        props.fullscreen && typeof props.fullscreen === 'string',
                      'modal-fullscreen': props.fullscreen && typeof props.fullscreen === 'boolean',
                      ['modal-dialog-scrollable']: props.scrollable,
                      [`modal-${props.size}`]: props.size,
                    },
                  ],
                },
                h(
                  'div',
                  { class: ['modal-content', props.className], ref: modalContentRef },
                  slots.default && slots.default(),
                ),
              ),
            ),
        ],
      ),
      props.backdrop &&
        h(CBackdrop, {
          class: 'modal-backdrop',
          visible: props.visible,
        }),
    ]
  },
})

export { CModal }