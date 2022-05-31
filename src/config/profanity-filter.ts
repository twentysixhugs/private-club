const profanityFilter = require('@twentysixhugs/profanity-filter');
profanityFilter.seed('profanity');
profanityFilter.setReplacementMethod('word');

export default profanityFilter;
