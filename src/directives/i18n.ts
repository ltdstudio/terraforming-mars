
import {DynamicTranslatableStringModel} from '../models/DynamicTranslatableStringModel';
import {PreferencesManager} from '../components/PreferencesManager';
import * as raw_translations from '../../assets/translations.json';

const TM_translations: {[x: string]: {[x: string]: string}} = raw_translations;

export function translateText(englishText: string | DynamicTranslatableStringModel): string {
  if (typeof englishText !== 'string') {
    const values = englishText.values;
    return translateText(englishText.message)
      .replace(/\$\{([0-9]{1})\}/gi, (_match, idx) => values[idx]);
  }
  let translatedText = englishText;
  const lang = PreferencesManager.loadValue('lang') || 'en';
  if (lang === 'en') return englishText;

  englishText = normalizeText(englishText);

  const languages = TM_translations[englishText];

  if (languages !== undefined && languages[lang] !== undefined) {
    translatedText = languages[lang];
  } else {
    let stripedText = englishText.replace(/^\((.*)\)$/gm, '$1');
    if (stripedText && stripedText !== englishText) {
      stripedText = translateText(stripedText);
      if (stripedText !== englishText) {
        translatedText = '(' + stripedText + ')';
      }
    } else if (stripedText && stripedText.length > 3) {
      console.log('Please translate "' + stripedText + '"');
    }
  }
  return translatedText;
}

function normalizeText(text: string): string {
  return text.replace(/[\n\r]/g, '').replace(/[ ]+/g, ' ').trim();
}

function translateChildren(node: Node) {
  for (let i = 0, length = node.childNodes.length; i < length; i++) {
    const child = node.childNodes[i];
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child as Text;
      const translatedText = translateText(text.data);
      if (translatedText !== text.data) {
        text.data = translatedText;
      }
    } else {
      translateChildren(child);
    }
  }
}

export function translateTextNode(el: HTMLElement) {
  translateChildren(el);
}

export const $t = translateText;
