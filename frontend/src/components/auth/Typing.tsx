
'use client'
import { TypeAnimation } from 'react-type-animation';

const typing =  [
  // Live classrooms, real engagement, built for how you actually teach and learn.
        "Live classrooms",
        1000,
        "Real engagement",
        1000,
        "How you actually teach",
        1000,
        "How you actually learn",
        2000,
    ];
const Typing = () => {
  return (
    <TypeAnimation
        sequence={typing}
        wrapper="span"
        speed={50}
        style={{ fontSize: "2em", display: "inline-block" }}
        repeat={Infinity}
    />
  )
}

export default Typing