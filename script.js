// Language List (16 Languages)
const languages = [
    { code: 'ko', name: 'Korean (한국어)', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' },
    { code: 'zh-CN', name: 'Chinese Simplified (简体中文)', flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Chinese Traditional (繁體中文)', flag: '🇹🇼' },
    { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
    { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
    { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
    { code: 'it', name: 'Italian (Italiano)', flag: '🇮🇹' },
    { code: 'ru', name: 'Russian (Русский)', flag: '🇷🇺' },
    { code: 'pt', name: 'Portuguese (Português)', flag: '🇵🇹' },
    { code: 'vi', name: 'Vietnamese (Tiếng Việt)', flag: '🇻🇳' },
    { code: 'th', name: 'Thai (ไทย)', flag: '🇹🇭' },
    { code: 'id', name: 'Indonesian (Bahasa Indonesia)', flag: '🇮🇩' },
    { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳' }
];

// State
let state = {
    sourceLang: 'auto',
    targetLang: 'es', // Default target Spanish
    sourceText: '',
    targetText: '',
    pronunciationText: '',
    detectedLang: '',
    activeTab: 'pronunciation'
};

// DOM Elements
const sourceLangBtn = document.getElementById('source-lang-btn');
const targetLangBtn = document.getElementById('target-lang-btn');
const sourceLangText = document.getElementById('source-lang-text');
const targetLangText = document.getElementById('target-lang-text');
const sourceDropdown = document.getElementById('source-lang-dropdown');
const targetDropdown = document.getElementById('target-lang-dropdown');
const sourceChevron = document.getElementById('source-chevron');
const targetChevron = document.getElementById('target-chevron');

const sourceSearch = document.getElementById('source-search');
const targetSearch = document.getElementById('target-search');
const sourceLangList = document.getElementById('source-lang-list');
const targetLangList = document.getElementById('target-lang-list');

const sourceText = document.getElementById('source-text');
const targetText = document.getElementById('target-text');
const charCount = document.getElementById('char-count');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const swapBtn = document.getElementById('swap-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');

const ttsSourceBtn = document.getElementById('tts-source-btn');
const ttsTargetBtn = document.getElementById('tts-target-btn');

// Target Output Pronunciation DOM
const targetPronunciationText = document.getElementById('target-pronunciation-text');
const copyTargetPronBtn = document.getElementById('copy-target-pron-btn');

// Insights DOM
const pronunciationOutput = document.getElementById('pronunciation-output');
const pronunciationNoteText = document.getElementById('pronunciation-note-text');
const copyPronunciationBtn = document.getElementById('copy-pronunciation-btn');

const tabPronunciationBtn = document.getElementById('tab-pronunciation-btn');
const tabGrammarBtn = document.getElementById('tab-grammar-btn');
const tabPronunciationContent = document.getElementById('tab-pronunciation');
const tabGrammarContent = document.getElementById('tab-grammar');

const grammarTagsContainer = document.getElementById('grammar-tags-container');
const grammarTokensGrid = document.getElementById('grammar-tokens-grid');
const grammarInsightText = document.getElementById('grammar-insight-text');

// Initialize UI
function init() {
    renderLangList('source', '');
    renderLangList('target', '');
    updateLangBtnText();
    
    // Event Listeners for Dropdowns
    sourceLangBtn.addEventListener('click', (e) => toggleDropdown('source', e));
    targetLangBtn.addEventListener('click', (e) => toggleDropdown('target', e));
    
    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#source-dropdown-container')) {
            closeDropdown('source');
        }
        if (!e.target.closest('#target-dropdown-container')) {
            closeDropdown('target');
        }
    });

    // Search input
    sourceSearch.addEventListener('input', (e) => renderLangList('source', e.target.value));
    targetSearch.addEventListener('input', (e) => renderLangList('target', e.target.value));

    // Text area events
    sourceText.addEventListener('input', handleTextInput);
    
    // Buttons
    clearBtn.addEventListener('click', clearText);
    swapBtn.addEventListener('click', swapLanguages);
    copyBtn.addEventListener('click', () => copyToClipboard(state.targetText, 'Translation copied!'));
    copyPronunciationBtn.addEventListener('click', () => copyToClipboard(state.pronunciationText, 'Pronunciation copied!'));
    copyTargetPronBtn.addEventListener('click', () => copyToClipboard(state.pronunciationText, 'Output Pronunciation copied!'));

    // Audio TTS
    ttsSourceBtn.addEventListener('click', () => speakText(state.sourceText, state.sourceLang));
    ttsTargetBtn.addEventListener('click', () => speakText(state.targetText, state.targetLang));

    // Sample chips
    document.querySelectorAll('.sample-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const sampleText = chip.getAttribute('data-sample');
            sourceText.value = sampleText;
            handleTextInput({ target: sourceText });
        });
    });

    // Tabs
    tabPronunciationBtn.addEventListener('click', () => switchTab('pronunciation'));
    tabGrammarBtn.addEventListener('click', () => switchTab('grammar'));
}

function switchTab(tabName) {
    state.activeTab = tabName;
    if (tabName === 'pronunciation') {
        tabPronunciationBtn.classList.add('active');
        tabGrammarBtn.classList.remove('active');
        tabPronunciationContent.classList.remove('hidden');
        tabGrammarContent.classList.add('hidden');
    } else {
        tabGrammarBtn.classList.add('active');
        tabPronunciationBtn.classList.remove('active');
        tabGrammarContent.classList.remove('hidden');
        tabPronunciationContent.classList.add('hidden');
    }
}

function toggleDropdown(type, e) {
    if(e) e.stopPropagation();
    const dropdown = type === 'source' ? sourceDropdown : targetDropdown;
    const chevron = type === 'source' ? sourceChevron : targetChevron;
    
    const isHidden = dropdown.classList.contains('hidden') || !dropdown.classList.contains('dropdown-enter');
    closeDropdown(type === 'source' ? 'target' : 'source');
    
    if (isHidden) {
        dropdown.classList.remove('hidden');
        setTimeout(() => {
            dropdown.classList.add('dropdown-enter');
            chevron.style.transform = 'rotate(180deg)';
        }, 10);
        
        const searchInput = type === 'source' ? sourceSearch : targetSearch;
        setTimeout(() => searchInput.focus(), 100);
    } else {
        closeDropdown(type);
    }
}

function closeDropdown(type) {
    const dropdown = type === 'source' ? sourceDropdown : targetDropdown;
    const chevron = type === 'source' ? sourceChevron : targetChevron;
    
    dropdown.classList.remove('dropdown-enter');
    chevron.style.transform = 'rotate(0deg)';
    
    setTimeout(() => {
        if (!dropdown.classList.contains('dropdown-enter')) {
            dropdown.classList.add('hidden');
        }
    }, 200);
}

function renderLangList(type, query) {
    const listEl = type === 'source' ? sourceLangList : targetLangList;
    const currentCode = type === 'source' ? state.sourceLang : state.targetLang;
    
    listEl.innerHTML = '';
    const q = query.toLowerCase().trim();
    let filtered = languages.filter(l => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
    
    if (type === 'source' && ('auto detect'.includes(q) || 'auto'.includes(q) || q === '')) {
        const autoLi = document.createElement('li');
        autoLi.className = `lang-item px-3 py-2 rounded-xl cursor-pointer text-xs font-medium ${currentCode === 'auto' ? 'active' : 'text-slate-300'}`;
        autoLi.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="flex items-center gap-2">🌐 Auto Detect</span>
                ${currentCode === 'auto' ? '<i class="fa-solid fa-check text-blue-400 text-xs"></i>' : ''}
            </div>
        `;
        autoLi.addEventListener('click', () => selectLanguage(type, 'auto'));
        listEl.appendChild(autoLi);
    }
    
    if (filtered.length === 0) {
        listEl.innerHTML += `<li class="px-3 py-2 text-xs text-slate-500 text-center">No language found</li>`;
        return;
    }
    
    filtered.forEach(lang => {
        const li = document.createElement('li');
        const isActive = currentCode === lang.code;
        li.className = `lang-item px-3 py-2 rounded-xl cursor-pointer text-xs font-medium ${isActive ? 'active' : 'text-slate-300'}`;
        li.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="flex items-center gap-2"><span>${lang.flag}</span> ${lang.name}</span>
                ${isActive ? '<i class="fa-solid fa-check text-blue-400 text-xs"></i>' : ''}
            </div>
        `;
        li.addEventListener('click', () => selectLanguage(type, lang.code));
        listEl.appendChild(li);
    });
}

function selectLanguage(type, code) {
    if (type === 'source') {
        state.sourceLang = code;
        if(code === state.targetLang && code !== 'auto') {
            state.targetLang = state.sourceLang;
        }
    } else {
        if (code === state.sourceLang) {
            state.sourceLang = state.targetLang;
        }
        state.targetLang = code;
    }
    
    updateLangBtnText();
    closeDropdown(type);
    
    renderLangList('source', sourceSearch.value);
    renderLangList('target', targetSearch.value);
    
    triggerTranslation();
}

function updateLangBtnText() {
    if (state.sourceLang === 'auto') {
        sourceLangText.textContent = state.detectedLang ? `Auto (${state.detectedLang})` : 'Auto Detect';
    } else {
        const lang = languages.find(l => l.code === state.sourceLang);
        sourceLangText.textContent = lang ? `${lang.flag} ${lang.name}` : state.sourceLang;
    }
    
    const tLang = languages.find(l => l.code === state.targetLang);
    targetLangText.textContent = tLang ? `${tLang.flag} ${tLang.name}` : state.targetLang;
}

function swapLanguages() {
    if (state.sourceLang === 'auto') {
        const temp = state.targetLang;
        state.targetLang = 'ko';
        state.sourceLang = temp;
    } else {
        const temp = state.sourceLang;
        state.sourceLang = state.targetLang;
        state.targetLang = temp;
    }
    
    updateLangBtnText();
    
    if (state.targetText) {
        sourceText.value = state.targetText;
        state.sourceText = state.targetText;
        charCount.textContent = state.sourceText.length;
    }
    
    triggerTranslation();
}

function clearText() {
    sourceText.value = '';
    targetText.value = '';
    state.sourceText = '';
    state.targetText = '';
    state.pronunciationText = '';
    charCount.textContent = '0';
    targetPronunciationText.textContent = '-';
    pronunciationOutput.innerHTML = `<span class="text-slate-500 italic text-xs">Translation output pronunciation will be shown here...</span>`;
    grammarTokensGrid.innerHTML = `<div class="text-slate-500 italic text-xs col-span-full py-4 text-center">Input a sentence to generate grammatical breakdown and part-of-speech analysis.</div>`;
    grammarTagsContainer.innerHTML = '';
}

function showToast(msg) {
    toastMsg.textContent = msg || 'Copied to clipboard!';
    toast.classList.add('toast-show');
    setTimeout(() => {
        toast.classList.remove('toast-show');
    }, 2500);
}

function copyToClipboard(text, msg) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        showToast(msg);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function speakText(text, langCode) {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    let targetLang = langCode === 'auto' ? 'ko-KR' : langCode;
    if (targetLang === 'en') targetLang = 'en-US';
    if (targetLang === 'ja') targetLang = 'ja-JP';
    if (targetLang === 'zh-CN') targetLang = 'zh-CN';
    if (targetLang === 'ko') targetLang = 'ko-KR';
    if (targetLang === 'es') targetLang = 'es-ES';
    if (targetLang === 'fr') targetLang = 'fr-FR';
    if (targetLang === 'de') targetLang = 'de-DE';
    if (targetLang === 'it') targetLang = 'it-IT';
    if (targetLang === 'ru') targetLang = 'ru-RU';
    if (targetLang === 'pt') targetLang = 'pt-PT';
    if (targetLang === 'vi') targetLang = 'vi-VN';
    if (targetLang === 'th') targetLang = 'th-TH';
    if (targetLang === 'id') targetLang = 'id-ID';
    if (targetLang === 'ar') targetLang = 'ar-SA';
    if (targetLang === 'hi') targetLang = 'hi-IN';

    utterance.lang = targetLang;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
}

// Handle Text Input
let debounceTimer = null;

function handleTextInput(e) {
    const text = e.target.value;
    if (text.length > 5000) {
        sourceText.value = text.substring(0, 5000);
    }
    state.sourceText = sourceText.value;
    charCount.textContent = state.sourceText.length;
    
    triggerTranslation();
}

function triggerTranslation() {
    clearTimeout(debounceTimer);
    
    if (!state.sourceText.trim()) {
        targetText.value = '';
        state.targetText = '';
        state.pronunciationText = '';
        targetPronunciationText.textContent = '-';
        return;
    }
    
    loadingOverlay.classList.remove('hidden');
    
    debounceTimer = setTimeout(() => {
        performTranslation();
    }, 450);
}

// Hangul Jamo / Gibberish Detection Helper
function isHangulJamoOnly(text) {
    const clean = text.replace(/\s+/g, '');
    if (!clean) return false;
    const jamoRegex = /^[\u3131-\u318E]+$/;
    return jamoRegex.test(clean);
}

async function performTranslation() {
    try {
        const textToTranslate = state.sourceText.trim();
        
        // Check isolated Jamo gibberish
        if (isHangulJamoOnly(textToTranslate)) {
            const romanizedJamo = romanizeKorean(textToTranslate);
            state.targetText = `[자음/모음 낱자]: ${textToTranslate}`;
            targetText.value = state.targetText;
            state.pronunciationText = `[발음]: ${romanizedJamo}`;
            updateOutputPronunciation(state.pronunciationText);
            updateInsights(textToTranslate, state.sourceLang, state.targetLang);
            pronunciationNoteText.textContent = "ℹ️ 'ㅏㅣㅏㅏㅣ'와 같은 낱자(자음/모음) 입력은 단어가 아니므로 번역 API 대신 낱자 로마자 발음을 표기합니다.";
            return;
        }

        const sourceCode = state.sourceLang === 'auto' ? 'Autodetect' : state.sourceLang;
        const langpair = `${sourceCode}|${state.targetLang}`;
        
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${langpair}`);
        const data = await res.json();
        
        if (data.responseData && data.responseData.translatedText) {
            if(data.responseStatus === 200) {
                 state.targetText = data.responseData.translatedText;
                 if (data.matches && data.matches.length > 0 && data.matches[0].srclang) {
                     state.detectedLang = data.matches[0].srclang;
                     updateLangBtnText();
                 }
            } else {
                 state.targetText = data.responseData.translatedText || ("Translation Note: " + data.responseStatus);
            }
        } else {
            state.targetText = 'Error translating text.';
        }
        
        targetText.value = state.targetText;
        
        // Full Universal Output Pronunciation Engine for ALL 16 LANGUAGES
        const outputPron = generateUniversalOutputPronunciation(state.targetText, state.targetLang);
        state.pronunciationText = outputPron;
        updateOutputPronunciation(outputPron);
        updateInsights(state.sourceText, state.sourceLang, state.targetLang);

    } catch (err) {
        console.error(err);
        targetText.value = 'Failed to connect to translation service.';
        targetPronunciationText.textContent = 'Error';
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

function updateOutputPronunciation(pronText) {
    targetPronunciationText.textContent = pronText || '-';
    if (pronText) {
        pronunciationOutput.innerHTML = `<span class="text-blue-300 font-bold font-mono text-base sm:text-lg">${pronText}</span>`;
    }
}

// -------------------------------------------------------------
// UNIVERSAL PHONETIC TRANSLITERATION ENGINE (FOR ALL 16 LANGUAGES)
// -------------------------------------------------------------

function generateUniversalOutputPronunciation(outputText, targetLang) {
    if (!outputText) return '';

    // 1. Japanese (日本語 → Kana & Kanji Romaji + Hangul)
    if (targetLang === 'ja' || /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(outputText)) {
        return romanizeJapaneseSentence(outputText);
    }

    // 2. Korean (한국어 → English Alphabet + Syllables)
    if (targetLang === 'ko' || /[가-힣ㄱ-ㅣ]/.test(outputText)) {
        return romanizeKorean(outputText) + ` (${outputText})`;
    }

    // 3. Chinese (中文 → Pinyin & Hangul reading)
    if (targetLang === 'zh-CN' || targetLang === 'zh-TW' || /[\u4e00-\u9fa5]/.test(outputText)) {
        return romanizeChineseSentence(outputText);
    }

    // 4. Spanish (Español)
    if (targetLang === 'es') {
        return romanizeSpanishSentence(outputText);
    }

    // 5. French (Français)
    if (targetLang === 'fr') {
        return romanizeFrenchSentence(outputText);
    }

    // 6. German (Deutsch)
    if (targetLang === 'de') {
        return romanizeGermanSentence(outputText);
    }

    // 7. English (English)
    if (targetLang === 'en') {
        return romanizeEnglishSentence(outputText);
    }

    // 8. Russian (Русский)
    if (targetLang === 'ru') {
        return cyrillicToLatinSentence(outputText);
    }

    // 9. Italian (Italiano)
    if (targetLang === 'it') {
        return romanizeItalianSentence(outputText);
    }

    // 10. Portuguese (Português)
    if (targetLang === 'pt') {
        return romanizePortugueseSentence(outputText);
    }

    // 11. Vietnamese (Tiếng Việt)
    if (targetLang === 'vi') {
        return romanizeVietnameseSentence(outputText);
    }

    // 12. Thai (ไทย)
    if (targetLang === 'th') {
        return romanizeThaiSentence(outputText);
    }

    // 13. Indonesian (Bahasa Indonesia)
    if (targetLang === 'id') {
        return romanizeIndonesianSentence(outputText);
    }

    // 14. Arabic (العربية)
    if (targetLang === 'ar') {
        return romanizeArabicSentence(outputText);
    }

    // 15. Hindi (हिन्दी)
    if (targetLang === 'hi') {
        return romanizeHindiSentence(outputText);
    }

    return convertLatinSentenceToPhonetic(outputText, targetLang);
}

// Sentence Word-by-Word Processor Helper
function processSentenceWordByWord(sentence, wordConverter) {
    if (!sentence) return '';
    const tokens = sentence.split(/(\s+)/);
    return tokens.map(token => {
        if (!token.trim()) return token;
        return wordConverter(token);
    }).join('');
}

// Universal Latin-to-Korean Phonetic Transliteration Engine
function latinToKoreanPhonetic(word, lang) {
    let clean = word.toLowerCase().trim();
    if (!clean) return word;
    
    const pStart = word.match(/^[^\wáéíóúñàâçèêëîïôûùüÿäöüß]+/)?.[0] || '';
    const pEnd = word.match(/[^\wáéíóúñàâçèêëîïôûùüÿäöüß]+$/)?.[0] || '';
    let core = clean.replace(/^[^\wáéíóúñàâçèêëîïôûùüÿäöüß]+|[^\wáéíóúñàâçèêëîïôûùüÿäöüß]+$/g, '');
    
    if (!core) return word;

    const COMMON_G2P = {
        'hello': '헬로', 'hi': '하이', 'how': '하우', 'are': '아', 'you': '유', 'weather': '웨더',
        'today': '투데이', 'is': '이즈', 'great': '그레이트', 'beautiful': '뷰티풀', 'friend': '프렌드',
        'world': '월드', 'travel': '트래블', 'love': '러브', 'thank': '땡크', 'thanks': '땡스',
        'good': '굿', 'morning': '모닝', 'night': '나잇', 'nice': '나이스', 'meet': '미트',
        'what': '왓', 'where': '웨어', 'when': '웬', 'why': '와이', 'who': '후', 'my': '마이',
        'the': '더', 'a': '어', 'an': '언', 'this': '디스', 'that': '댓', 'family': '패밀리',
        'hola': '올라', 'gracias': '그라시아스', 'buenos': '부엔오스', 'buenas': '부엔아스',
        'días': '디아스', 'noches': '노체스', 'adiós': '아디오스', 'por': '포르', 'favor': '파보르',
        'sí': '시', 'no': '노', 'te': '떼', 'amo': '아모', 'amigo': '아미고', 'amiga': '아미가',
        'el': '엘', 'la': '라', 'es': '에스', 'está': '에스타', 'bien': '비엔', 'muy': '무이',
        'donde': '돈데', 'tiempo': '티엠포', 'bonito': '보니토', 'hoy': '오이',
        'bonjour': '봉주르', 'merci': '메르시', 'beaucoup': '보꾸', 'revoir': '르부아르',
        'oui': '위', 'non': '농', 'je': '주', 't\'aime': '똠', 'salut': '살뤼', 'comment': '코망',
        'guten': '구텐', 'tag': '탁', 'morgen': '모르겐', 'danke': '단케', 'vielen': '필렌',
        'tschüss': '츄스', 'auf': '아우프', 'wiedersehen': '비더제엔', 'ja': '야', 'nein': '나인',
        'ciao': '치아오', 'grazie': '그라치에', 'buongiorno': '본조르노', 'arrivederci': '아리베데르치',
        'olá': '올라', 'obrigado': '오브리가두', 'obrigada': '오브리가다', 'tchau': '차우'
    };

    if (COMMON_G2P[core]) {
        return pStart + COMMON_G2P[core] + pEnd;
    }

    let converted = core;
    if (lang === 'es') {
        converted = converted.replace(/que/g, '께').replace(/qui/g, '끼').replace(/ch/g, '체').replace(/ll/g, '야').replace(/ñ/g, '냐').replace(/j/g, '하');
    } else if (lang === 'fr') {
        converted = converted.replace(/eau/g, '오').replace(/ou/g, '우').replace(/ch/g, '슈').replace(/oi/g, '와').replace(/ez/g, '에').replace(/er/g, '에');
    } else if (lang === 'de') {
        converted = converted.replace(/sch/g, '슈').replace(/ch/g, '히').replace(/w/g, '브').replace(/z/g, '츠').replace(/v/g, '프').replace(/ie/g, '이').replace(/ei/g, '아이');
    }

    let kor = converted
        .replace(/tion/g, '션').replace(/ing/g, '잉').replace(/oo/g, '우').replace(/ee/g, '이')
        .replace(/ea/g, '이').replace(/ai/g, '에').replace(/ay/g, '에').replace(/th/g, '더')
        .replace(/sh/g, '쉬').replace(/ch/g, '치').replace(/ph/g, '프').replace(/qu/g, '쿠')
        .replace(/a/g, '아').replace(/e/g, '에').replace(/i/g, '이').replace(/o/g, '오').replace(/u/g, '우')
        .replace(/b/g, '브').replace(/c/g, '크').replace(/d/g, '드').replace(/f/g, '프').replace(/g/g, '그')
        .replace(/h/g, '하').replace(/j/g, '제').replace(/k/g, '크').replace(/l/g, '르').replace(/m/g, '므')
        .replace(/n/g, '느').replace(/p/g, '프').replace(/r/g, '르').replace(/s/g, '스').replace(/t/g, '트')
        .replace(/v/g, '브').replace(/w/g, '우').replace(/y/g, '이').replace(/z/g, '즈');

    kor = kor.replace(/브르/g, '브').replace(/프르/g, '프').replace(/드르/g, '드').replace(/크르/g, '크');

    return pStart + kor + pEnd;
}

function convertLatinSentenceToPhonetic(sentence, lang) {
    return processSentenceWordByWord(sentence, (word) => latinToKoreanPhonetic(word, lang));
}

// Language Specific Sentence Transliterators
function romanizeSpanishSentence(sentence) {
    return processSentenceWordByWord(sentence, (word) => latinToKoreanPhonetic(word, 'es'));
}

function romanizeFrenchSentence(sentence) {
    return processSentenceWordByWord(sentence, (word) => latinToKoreanPhonetic(word, 'fr'));
}

function romanizeGermanSentence(sentence) {
    return processSentenceWordByWord(sentence, (word) => latinToKoreanPhonetic(word, 'de'));
}

function romanizeEnglishSentence(sentence) {
    return processSentenceWordByWord(sentence, (word) => latinToKoreanPhonetic(word, 'en'));
}

function romanizeItalianSentence(sentence) {
    return processSentenceWordByWord(sentence, (word) => latinToKoreanPhonetic(word, 'it'));
}

function romanizePortugueseSentence(sentence) {
    return processSentenceWordByWord(sentence, (word) => latinToKoreanPhonetic(word, 'pt'));
}

function romanizeIndonesianSentence(sentence) {
    return processSentenceWordByWord(sentence, (word) => latinToKoreanPhonetic(word, 'id'));
}

function romanizeVietnameseSentence(sentence) {
    const VIETNAMESE_MAP = {
        'xin': '씬', 'chào': '짜오', 'cảm': '까름', 'ơn': '엄', 'tạm': '땀', 'biệt': '비엣',
        'vâng': '벙', 'không': '콩', 'tôi': '또이', 'yêu': '이에우', 'bạn': '반'
    };
    return processSentenceWordByWord(sentence, (word) => {
        const clean = word.toLowerCase();
        if (VIETNAMESE_MAP[clean]) return VIETNAMESE_MAP[clean];
        return latinToKoreanPhonetic(word, 'vi');
    });
}

function romanizeThaiSentence(sentence) {
    const THAI_WORDS = {
        'สวัสดี': '사왓디 (Sawatdee)', 'ขอบคุณ': '콥쿤 (Khop khun)', 'ลาก่อน': '라곤 (La gon)',
        'ใช่': '차이 (Chai)', 'ไม่': '마이 (Mai)', 'ฉัน': '찬 (Chan)', 'รัก': '락 (Rak)', 'คุณ': '쿤 (Khun)'
    };
    let res = sentence;
    for (let k in THAI_WORDS) {
        res = res.replace(new RegExp(k, 'g'), THAI_WORDS[k] + ' ');
    }
    return res.trim();
}

function romanizeHindiSentence(sentence) {
    const HINDI_WORDS = {
        'नमस्ते': '나마스테 (Namaste)', 'धन्यवाद': '단야바드 (Dhanyavaad)', 'हाँ': '한 (Haan)',
        'नहीं': '나힌 (Nahin)', 'अलविदा': '알비다 (Alvida)'
    };
    let res = sentence;
    for (let k in HINDI_WORDS) {
        res = res.replace(new RegExp(k, 'g'), HINDI_WORDS[k] + ' ');
    }
    return res.trim();
}

function romanizeChineseSentence(sentence) {
    const CHINESE_WORDS = {
        '你好': '니하오 (Nǐ hǎo)', '谢谢': '씨에씨에 (Xièxie)', '再见': '자이찌엔 (Zàijiàn)',
        '早上好': '자오샹하오 (Zǎoshang hǎo)', '晚安': '완안 (Wǎn\'ān)', '对不起': '두이부치 (Duìbuqǐ)',
        '没关系': '메이관시 (Méi guānxi)', '我是': '워스 (Wǒ shì)', '我爱你': '워아이니 (Wǒ ài nǐ)',
        '朋友': '펑요우 (Péngyou)', '今天': '진티엔 (Jīntiān)', '天气': '티엔치 (Tiānqì)', '很好': '헌하오 (Hěn hǎo)'
    };
    let res = sentence;
    for (let k in CHINESE_WORDS) {
        res = res.replace(new RegExp(k, 'g'), CHINESE_WORDS[k] + ' ');
    }
    if (res !== sentence) return res.trim();
    return `Pinyin: ${sentence} [Listen via 🔊 Audio]`;
}

function romanizeJapaneseSentence(sentence) {
    const JAPANESE_WORDS = {
        'こんにちは': '콘니치와 (Konnichiwa)', 'こんばんは': '콘방와 (Konbanwa)',
        'おはようございます': '오하요 고자이마스 (Ohayou gozaimasu)', 'おはよう': '오하요 (Ohayou)',
        'ありがとうございます': '아리가토 고자이마스 (Arigatou gozaimasu)', 'ありがとう': '아리가토 (Arigatou)',
        'さようなら': '사요나라 (Sayounara)', 'じゃあね': '쟈네 (Jaa ne)', 'はい': '하이 (Hai)',
        'いいえ': '이이에 (Iie)', 'すみません': '스미마센 (Sumimasen)', 'ごめんなさい': '고멘나사이 (Gomen nasai)',
        '愛してる': '아이시테루 (Aishiteru)', '好き': '스키 (Suki)', '大好き': '다이스키 (Daisuki)',
        '大丈夫': '다이죠부 (Daijoubu)', '先生': '센세 (Sensei)', '日本': '니혼 (Nihon)',
        '友達': '토모다치 (Tomodachi)', 'おいしい': '오이시 (Oishii)', '何': '나니 (Nani)',
        '私': '와타시 (Watashi)', 'あなた': '아나타 (Anata)', '今日': '쿄 (Kyou)', '天気': '텐키 (Tenki)', 'いい': '이이 (Ii)'
    };
    let res = sentence;
    for (let key in JAPANESE_WORDS) {
        if (res.includes(key)) {
            res = res.replace(new RegExp(key, 'g'), JAPANESE_WORDS[key] + ' ');
        }
    }
    return fullKanaToRomaji(res);
}

function cyrillicToLatinSentence(sentence) {
    const dict = {
        'здравствуйте': '즈드라스뜨부이떼 (Zdravstvuyte)', 'спасибо': '스파시바 (Spasibo)',
        'привет': '쁘리볫 (Privet)', 'да': '다 (Da)', 'нет': '녯 (Nyet)'
    };
    return processSentenceWordByWord(sentence, (word) => {
        const clean = word.toLowerCase();
        if (dict[clean]) return dict[clean];
        return cyrillicToLatin(word);
    });
}

function arabicToHangul(sentence) {
    const dict = {
        'مرحبا': '마르하반 (Marhaban)', 'شكرا': '슈크란 (Shukran)',
        'نعم': '나암 (Naam)', 'لا': '라 (La)'
    };
    let res = sentence;
    for (let k in dict) {
        res = res.replace(new RegExp(k, 'g'), dict[k] + ' ');
    }
    return res.trim();
}

function romanizeArabicSentence(sentence) {
    return arabicToHangul(sentence);
}

// Japanese Full Kana Converter
function fullKanaToRomaji(str) {
    const kanaRomaji = {
        'きゃ':'kya','きゅ':'kyu','きょ':'kyo',
        'しゃ':'sha','しゅ':'shu','しょ':'sho',
        'ちゃ':'cha','ちゅ':'chu','ちょ':'cho',
        'にゃ':'nya','にゅ':'nyu','にょ':'nyo',
        'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo',
        'みゃ':'mya','みゅ':'myu','みょ':'myo',
        'りゃ':'rya','りゅ':'ryu','りょ':'ryo',
        'ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
        'じゃ':'ja','じゅ':'ju','じょ':'jo',
        'びゃ':'bya','びゅ':'byu','びょ':'byo',
        'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
        'あ':'a','い':'i','う':'u','え':'e','お':'o',
        'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
        'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
        'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
        '나':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
        'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
        'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
        'や':'ya','ゆ':'yu','よ':'yo',
        'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
        'わ':'wa','を':'wo','ん':'n',
        'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
        'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
        'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
        'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
        'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
        'ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o',
        'カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko',
        'サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so',
        'タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to',
        'ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no',
        'ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho',
        'マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo',
        'ヤ':'ya','ユ':'yu','ヨ':'yo',
        'ラ':'ra','リ':'ri','ル':'ru','レ':'re','ロ':'ro',
        'ワ':'wa','ヲ':'wo','ン':'n'
    };

    let result = '';
    let i = 0;
    while (i < str.length) {
        if (str[i] === 'っ' || str[i] === 'ッ') {
            if (i + 1 < str.length) {
                let nextKana = kanaRomaji[str[i+1]] || '';
                if (nextKana) result += nextKana[0];
            }
            i++;
            continue;
        }
        if (i + 1 < str.length) {
            let pair = str[i] + str[i+1];
            if (kanaRomaji[pair]) {
                result += kanaRomaji[pair];
                i += 2;
                continue;
            }
        }
        result += kanaRomaji[str[i]] || str[i];
        i++;
    }
    
    if (result.length > 0) {
        result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
}

// -------------------------------------------------------------
// HANGUL ROMANIZATION ENGINE
// -------------------------------------------------------------

const CHO_LIST = ["g", "gg", "n", "d", "dd", "r", "m", "b", "bb", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
const JOONG_LIST = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
const JONG_LIST = ["", "g", "gg", "gs", "n", "nj", "nh", "d", "l", "lg", "lm", "lb", "ls", "lt", "lp", "lh", "m", "b", "bs", "s", "ss", "ng", "j", "ch", "k", "t", "p", "h"];

const SINGLE_JAMO_MAP = {
    'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt', 'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp',
    'ㅅ': 's', 'ㅆ': 'ss', 'ㅇ': 'ng', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
    'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo', 'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye',
    'ㅗ': 'o', 'ㅘ': 'wa', 'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo', 'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i'
};

function romanizeKorean(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const code = char.charCodeAt(0);
        
        if (code >= 0xAC00 && code <= 0xD7A3) {
            const uniIndex = code - 0xAC00;
            const choIndex = Math.floor(uniIndex / (21 * 28));
            const joongIndex = Math.floor((uniIndex % (21 * 28)) / 28);
            const jongIndex = uniIndex % 28;
            
            let cho = CHO_LIST[choIndex];
            let joong = JOONG_LIST[joongIndex];
            let jong = JONG_LIST[jongIndex];

            let rom = cho + joong + jong;
            if (i === 0 || text[i-1] === ' ') {
                rom = rom.charAt(0).toUpperCase() + rom.slice(1);
            }
            result += rom;
        } 
        else if (SINGLE_JAMO_MAP[char]) {
            result += SINGLE_JAMO_MAP[char] + ' ';
        } 
        else {
            result += char;
        }
    }
    return result.replace(/\s+/g, ' ').trim();
}

function cyrillicToLatin(str) {
    const map = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y',
        'к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f',
        'х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
    };
    let res = str.split('').map(c => map[c.toLowerCase()] || c).join('');
    if (res.length > 0) res = res.charAt(0).toUpperCase() + res.slice(1);
    return res;
}

// -------------------------------------------------------------
// GRAMMAR & SENTENCE ANALYSIS ENGINE
// -------------------------------------------------------------

function updateInsights(text, srcLang, tgtLang) {
    if (!text.trim()) return;
    analyzeGrammar(text, state.targetText);
}

function analyzeGrammar(sourceText, targetText) {
    if (!sourceText.trim()) return;

    let sentenceType = 'Statement (평서문)';
    if (sourceText.includes('?')) sentenceType = 'Question (의문문)';
    else if (sourceText.includes('!')) sentenceType = 'Exclamation (감탄문)';
    
    const words = sourceText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    grammarTagsContainer.innerHTML = `
        <span class="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-[11px] font-medium border border-purple-500/30">${sentenceType}</span>
        <span class="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 text-[11px] font-medium border border-blue-500/30">${wordCount} Words</span>
        <span class="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/30">Auto Syntax Tagged</span>
    `;

    let tokensHTML = '';
    const cleanWords = sourceText.replace(/[.,!?~]/g, '').split(/\s+/).slice(0, 9);

    cleanWords.forEach(word => {
        if (!word) return;
        const posInfo = detectPOS(word);
        tokensHTML += `
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-slate-100 text-xs">${word}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded ${posInfo.badgeClass}">${posInfo.tag}</span>
                </div>
                <span class="text-[11px] text-slate-400 font-mono">${posInfo.desc}</span>
            </div>
        `;
    });

    grammarTokensGrid.innerHTML = tokensHTML || `<div class="text-slate-500 italic text-xs col-span-full py-4 text-center">No structural tokens detected.</div>`;

    let insight = "";
    if (/[가-힣]/.test(sourceText)) {
        insight = "한국어 어순은 [주어 + 목적어 + 동사 (SOV)] 구조입니다. 영어(SVO), 스페인어, 프랑스어로 번역 시 어순 전환이 발생합니다.";
    } else if (/[a-zA-Z]/.test(sourceText)) {
        insight = "English follows [Subject + Verb + Object (SVO)] word order. Notice how verbs precede objects in the target sentence.";
    } else if (/[一-龥ぁ-んァ-ン]/.test(sourceText)) {
        insight = "Japanese/Chinese sentence structures. Japanese follows SOV (주어+목적어+동사) like Korean.";
    } else {
        insight = "Sentence structure reflects natural phrasing across target language grammar patterns.";
    }

    grammarInsightText.textContent = insight;
}

function detectPOS(word) {
    const w = word.toLowerCase();

    if (/[가-힣]/.test(word)) {
        if (/(은|는|이|가)$/.test(word)) return { tag: 'Subject Particle (주격조사)', desc: '주어 역할 지칭', badgeClass: 'bg-blue-500/20 text-blue-300' };
        if (/(을|를)$/.test(word)) return { tag: 'Object Particle (목적격조사)', desc: '목적어 역할 지칭', badgeClass: 'bg-indigo-500/20 text-indigo-300' };
        if (/(에|에서|으로|로)$/.test(word)) return { tag: 'Adverbial Particle (부사격조사)', desc: '장소/방향 지칭', badgeClass: 'bg-emerald-500/20 text-emerald-300' };
        if (/(다|요|습니다|합시다)$/.test(word)) return { tag: 'Verb / Ending (동사/어미)', desc: '서술어 / 서술 종결', badgeClass: 'bg-rose-500/20 text-rose-300' };
        return { tag: 'Noun / Vocabulary (체언/단어)', desc: '명사 및 독립어', badgeClass: 'bg-purple-500/20 text-purple-300' };
    }

    if (['the', 'a', 'an'].includes(w)) return { tag: 'Article (관사)', desc: 'Determiner', badgeClass: 'bg-amber-500/20 text-amber-300' };
    if (['i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that'].includes(w)) return { tag: 'Pronoun (대명사)', desc: 'Subject / Object', badgeClass: 'bg-blue-500/20 text-blue-300' };
    if (['is', 'are', 'am', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'can', 'go', 'make', 'see', 'open', 'learn'].includes(w)) return { tag: 'Verb (동사)', desc: 'Action / State', badgeClass: 'bg-rose-500/20 text-rose-300' };
    if (['in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'from', 'up'].includes(w)) return { tag: 'Preposition (전치사)', desc: 'Relational word', badgeClass: 'bg-emerald-500/20 text-emerald-300' };

    return { tag: 'Noun / Word (명사/단어)', desc: 'Lexical Token', badgeClass: 'bg-purple-500/20 text-purple-300' };
}

// Run
document.addEventListener('DOMContentLoaded', init);
