import eventsToRecord from './events-to-record'
import elementsToBindTo from './elements-to-bind-to'
import Selector from 'css-selector-generator'

const selector = new Selector()

class EventRecorder {
  start () {
    const elements = document.querySelectorAll(elementsToBindTo.join(','))

    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < eventsToRecord.length; j++) {
        elements[i].addEventListener(eventsToRecord[j], recordEvent)
      }
    }

    chrome.runtime.onMessage.addListener((msg, sender, resp) => {
      if (msg.control && msg.control === 'get-current-url') {
        resp({ href: window.location.href })
      }
    })
    const msg = { control: 'event-recorder-started' }
    sendMessage(msg)
    console.debug('Puppeteer Recorder in-page EventRecorder started')
  }
}

function recordEvent (e) {
  const msg = {
    selector: selector.getSelector(e.target),
    value: e.target.value,
    action: e.type,
    keyCode: e.keyCode ? e.keyCode : null,
    href: e.target.href ? e.target.href : null,
    coordinates: getCoordinates(e)
  }
  sendMessage(msg)
}

function getCoordinates (evt) {
  const eventsWithCoordinates = {
    mouseup: true,
    mousedown: true,
    mousemove: true,
    mouseover: true
  }
  return eventsWithCoordinates[evt.type] ? { x: evt.clientX, y: evt.clientY } : null
}

function sendMessage (msg) {
  console.debug('sending message', msg)
  try {
    chrome.runtime.sendMessage(msg)
  } catch (err) {
    console.debug('caught err', err)
  }
}

window.eventRecorder = new EventRecorder()
window.eventRecorder.start()
