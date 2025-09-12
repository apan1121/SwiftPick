const sounds = {
    start: 'dist/mp3/ding.mp3',
    tick: 'dist/mp3/dong.mp3',
    winners: [
        'dist/mp3/winner1.mp3',
        'dist/mp3/winner2.mp3',
        'dist/mp3/winner3.mp3',
        'dist/mp3/winner4.mp3',
        'dist/mp3/winner5.mp3',
    ],
};

const cache = new Map();

function load(src){
    if (cache.has(src)) return cache.get(src);
    const a = new Audio(src);
    cache.set(src, a);
    return a;
}

export function playStart(){ try { load(sounds.start).play(); } catch (e) {} }
export function playTick(){ try { load(sounds.tick).play(); } catch (e) {} }
export function playWinner(){ try { const list = sounds.winners; load(list[Math.floor(Math.random()*list.length)]).play(); } catch (e) {} }

export default { playStart, playTick, playWinner };

