import { motion } from 'framer-motion';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function Hero() {
  return (
    <motion.div className="hero" variants={container} initial="hidden" animate="visible">
      <motion.p className="hero-eyebrow" variants={item}>
        CodeAlpha Internship &middot; Task 02
      </motion.p>

      <motion.h1 className="hero-title" variants={item}>
        Speech Emotion Recognition
      </motion.h1>

      <motion.p className="hero-subtitle" variants={item}>
        A CNN trained on MFCC features to classify emotion from speech audio
      </motion.p>

      <motion.div className="hero-specs" variants={item}>
        <span className="spec">
          <span className="spec-label">Model</span>
          <span className="spec-value">CNN &middot; 3x Conv2D</span>
        </span>
        <span className="spec-divider" />
        <span className="spec">
          <span className="spec-label">Dataset</span>
          <span className="spec-value">RAVDESS</span>
        </span>
        <span className="spec-divider" />
        <span className="spec">
          <span className="spec-label">Features</span>
          <span className="spec-value">MFCC (40)</span>
        </span>
        <span className="spec-divider" />
        <span className="spec">
          <span className="spec-label">Test acc.</span>
          <span className="spec-value">~40%</span>
        </span>
      </motion.div>
    </motion.div>
  );
}

export default Hero;