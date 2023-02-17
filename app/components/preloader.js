import Component from "classes/Component"
import each from 'lodash/each'
import GSAP from 'gsap'
import { split } from 'utils/text'
import Splitting from 'splitting'

export default class Preloader extends Component {
  constructor() {
    super({
      element: '.preloader',
      elements: {
        title: '.preloader__text',
        number: '.preloader__number',
        numberText:'.preloader__number__text',
        images: document.querySelectorAll('img')
      }
    })

    //Splitting.js word split
    this.elements.titleSpans = Splitting({
      target: this.elements.title,
      by: 'lines'
    })

    //this.elements.titleSpans = this.elements.title.querySelectorAll('span span');

    this.length = 0

    console.log(this.element, this.elements)

    this.createLoader()
  }

  //--------------------------
  createLoader() {
    each(this.elements.images, element => {
        element.onload = _ => this.onAssetLoaded(element)
        element.src = element.getAttribute('data-src')
    })
  }

  //--------------------------
  onAssetLoaded(image){
    this.length++;

    const percent = this.length / this.elements.images.length
    
    this.elements.numberText.innerHTML = `${Math.round(percent * 100)}%`

    if(percent === 1){
      this.onLoaded()
    }
  }

  //--------------------------
  onLoaded(){
    return new Promise(resolve => {

      // Gsap delay
      this.animateOut = GSAP.timeline({
        delay: 4,
      })

      // Text.js
      // Splitting.js animate out word by word
      // this.animateOut.to(this.elements.title.querySelectorAll('.word'), {
      //   autoAlpha:0,
      //   stagger:0.1,
      //   y: -10
      // })

      // Splitting.js fade out line by line
      let words = [...this.elements.title.querySelectorAll('.word')];

      let lineNums = words.map(word => {
        return parseFloat(getComputedStyle(word).getPropertyValue('--line-index'));
      });

      lineNums.forEach((lineNum, index) => {
        this.animateOut.to(words[index], {
          autoAlpha: 0,
          duration :1,
          //ease:'expo.out',
          stagger  : 0.1,
          y: 100,
        }, lineNum * 0.3);
      })
      
      //Fade out the preloader loading percentage
      this.animateOut.to(this.elements.numberText, {
        autoAlpha: 0,
        duration :1,
        //ease:'expo.out',
        stagger  : 0.1,
        y: '100%',
      })

      // Fade out the preloader
      this.animateOut.to(this.element, {
        duration :1.5,
        ease:'expo.out',
        scaleY: 0,
        transformOrigin: '0 0',
      })
      
      // Preloader completed
      this.animateOut.call( _ => {
        this.emit('completed')
      })

    })
  }


  //--------------------------
  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}
