import pt from './pt.json';
import en from './en.json';

const strings = {
  pt,
  'pt-BR': pt,
  en,
};

const getString = (domain, key, params, acceptLanguage = 'en') => {
  let string = strings[acceptLanguage][domain][key];

  if (params) {
    Object.keys(params).forEach((param) => {
      string = string.replace(`{${param}}`, params[param]);
    });
  }

  return string;
};

const translations = {
  getString,
};

export default translations;
