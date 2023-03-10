import GSAP from 'gsap'

import Prefix from 'prefix'

import each from 'lodash/each'
import map from 'lodash/each'

import normalizeWheel from 'normalize-wheel'

import Label from 'animations/Label'
import Paragraph from 'animations/Paragraph'
import Title from 'animations/Title'

export default class Page {
  constructor({
    element,
    elements,
    id
  }) {
    this.selector = element
    this.selectorChildren = {
      ...elements,
      animationsTitles: '[data-animation="title"]',
      animationsParagraphs: '[data-animation="paragraph"]',
      animationsLabels: '[data-animation="label"]',
    }

    console.log(this.selectorChildren)
    this.id = id
    this.transformPrefix = Prefix('transform')
    this.onMouseWheelEvent = this.onMouseWheel.bind(this)
    console.log(this.transformPrefix)
  }

  //----------------------------------------
  create() {
    this.element = document.querySelector(this.selector)
    this.elements = {}

    this.scroll = {
      current:0,
      target:0,
      last: 0,
      limit: 0,
    }

    each(this.selectorChildren, (entry, key) => {
      if (
        entry instanceof window.HTMLElement ||
        entry instanceof window.NodeList ||
        Array.isArray(entry)
      ) {
        this.elements[key] = entry;
      } else {
        this.elements[key] = document.querySelectorAll(entry);

        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else if (this.elements[key].length === 1) {
          this.elements[key] = document.querySelector(entry);
        }
      }
    });

    this.createAnimations()
  }

  //----------------------------------------
  createAnimations(){
    this.animations = [];

    //----------------
    // Titles
    this.animationsTitles = map(this.elements.animationsTitles, element => {
      return new Title({
        element
      })
    })
    this.animations.push(...this.animationsTitles);

    //----------------
    // Paragraphs
    this.animationsParagraphs = map(this.elements.animationsParagraphs, element => {
        return new Paragraph({
          element
        })
      }
    )
    this.animations.push(...this.animationsParagraphs)

    //----------------
    // Labels
    this.animationsLabels = map(this.elements.animationsLabels, element => {
      return new Label({
        element
      })
    })
    this.animations.push(...this.animationsLabels)
    
  }

  //----------------------------------------
  show() {
    return new Promise(resolve => {
      this.animationIn = GSAP.timeline()

      this.animationIn.fromTo(this.element, {
        autoAlpha: 0,
      }, 
      {
        autoAlpha: 1,
      })

      this.animationIn.call((_) => {
        this.addEventListeners();

        resolve();
      })
    })
  }


  //----------------------------------------
  hide() {
    return new Promise((resolve) => {
      this.removeEventListeners()

      this.animationIn = GSAP.timeline();

      this.animationIn.to(this.element, {
        autoAlpha: 0,
        onComplete: resolve,
      });
    });
  }

  //----------------------------------------
  onMouseWheel (event){
    const { pixelY }  = normalizeWheel(event)
    this.scroll.target += pixelY
  }

  //----------------------------------------
  onResize() {
    if (this.elements.wrapper) {
      this.scroll.limit = this.elements.wrapper.clientHeight - window.innerHeight;
    }
    
    each(this.animations, animation => animation.onResize());

    // for (const animation of this.animations) {
    //   animation.onResize();
    // }
  }

  //----------------------------------------
  update(){
    this.scroll.target = GSAP.utils.clamp(0, this.scroll.limit, this.scroll.target)
    this.scroll.current = GSAP.utils.interpolate(this.scroll.current, this.scroll.target, 0.06)

    if(this.elements.wrapper){
      this.elements.wrapper.style[this.transformPrefix] = `translateY(-${this.scroll.current}px)`      
    }
  }

  //----------------------------------------
  addEventListeners(){
    window.addEventListener('mousewheel', this.onMouseWheelEvent)
  }

  removeEventListeners(){
    window.removeEventListener('mousewheel', this.onMouseWheelEvent)
  }
}