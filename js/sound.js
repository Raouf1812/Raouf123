/* ==========================================================
   AUDIO ENGINE (Web Audio API) - SYNTHESIZED HAPTIC SOUNDS
   ========================================================== */

const SoundEngine = (function() {
    let audioCtx = null;
    let enabled = true;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    return {
        isEnabled: function() {
            return enabled;
        },
        setEnabled: function(val) {
            enabled = !!val;
        },
        // Subtle crisp UI Click
        playClick: function() {
            if (!enabled) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.04);
            } catch (e) {}
        },
        // Metallic Gold Coin sound (for deposits & salary)
        playCoin: function() {
            if (!enabled) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const now = ctx.currentTime;
                
                // Primary ring
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(987.77, now); // B5
                osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6
                gain1.gain.setValueAtTime(0.12, now);
                gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.35);

                // Secondary harmonic
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(1975.53, now + 0.03);
                gain2.gain.setValueAtTime(0.08, now + 0.03);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(now + 0.03);
                osc2.stop(now + 0.28);
            } catch (e) {}
        },
        // Elegant ascending chime (Success / Expense saved)
        playSuccess: function() {
            if (!enabled) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const startTime = ctx.currentTime + (idx * 0.06);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, startTime);
                    gain.gain.setValueAtTime(0.09, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + 0.28);
                });
            } catch (e) {}
        },
        // Soft delete frequency drop
        playDelete: function() {
            if (!enabled) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.18);
            } catch (e) {}
        },
        // Fanfare for goal completion or full debt clearance
        playCelebration: function() {
            if (!enabled) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                chord.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const st = ctx.currentTime + (i * 0.08);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, st);
                    gain.gain.setValueAtTime(0.12, st);
                    gain.gain.exponentialRampToValueAtTime(0.001, st + 0.6);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(st);
                    osc.stop(st + 0.6);
                });
            } catch (e) {}
        }
    };
})();

if (typeof window !== 'undefined') {
    window.SoundEngine = SoundEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundEngine;
}
