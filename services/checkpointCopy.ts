// Coaching copy for the checkpoints the engine actually scores. Ball Toss,
// Hip-Shoulder Separation, and Pronation are excluded from grading in the
// engine (score: null) and have no entries here on purpose — see
// services/analyzer.ts's mapping, which skips null-score checkpoints
// entirely rather than falling back to placeholder text.
export type CheckpointCopy = {
  label: string;
  correctionTitle: string; // short, e.g. "Create a deeper racket drop"
  rec: string;              // longer coaching detail
  good: string;              // short praise phrase for the strengths list
  drill: string;
};

export const CHECKPOINT_COPY: Record<string, CheckpointCopy> = {
  "Setup & Alignment": {
    label: "Setup & alignment",
    correctionTitle: "Square up your stance",
    rec: "Set up a consistent platform: feet about shoulder-width, front foot pointed toward the net post, shoulders lined up with your stance. A repeatable setup makes every later checkpoint easier to hit.",
    good: "Consistent, balanced stance",
    drill: "Stance-and-hold serves · 3 × 8 (freeze at setup, check foot/shoulder alignment)"
  },
  "Loading & Trophy": {
    label: "Knee bend & leg drive",
    correctionTitle: "Sink deeper into your legs",
    rec: "Your legs are the engine of the serve — at the trophy position sink into roughly a 115–135° knee bend and drive up through the ball. Keep the tossing arm fully extended and leave it up until the racquet drops; dropping it early tilts the shoulders down and pulls your contact point lower.",
    good: "Strong leg drive and toss-arm extension",
    drill: "Sock-serve shadow swings · 3 × 8"
  },
  "Racket Drop": {
    label: "Racket drop",
    correctionTitle: "Create a deeper racket drop",
    rec: "A full racquet drop is where the serve's whip comes from. At the deepest point the racquet head should hang well below your wrist, down your back — relax the arm and let gravity drop it before you drive up to contact.",
    good: "Deep, relaxed racquet drop",
    drill: "Racket-drop pause serves · 3 × 6 (hold the back-scratch position for a beat)"
  },
  "Contact Point": {
    label: "Contact point",
    correctionTitle: "Reach higher at contact",
    rec: "Meet the ball at full stretch — contact near 100% of your standing reach with the elbow fully extended. Reaching up, not out, is what buys both power and net clearance.",
    good: "High, fully extended contact",
    drill: "Platform-to-jump serves · 3 × 6"
  },
  "Follow-Through": {
    label: "Follow-through",
    correctionTitle: "Finish further across your body",
    rec: "After contact, let the racquet arm release diagonally across your body toward the opposite hip. Cutting the swing short bleeds racquet-head speed and loads the shoulder.",
    good: "Full, cross-body finish",
    drill: "Finish-and-freeze serves · 2 × 10"
  },
  "Landing Balance": {
    label: "Landing balance",
    correctionTitle: "Stick your landing",
    rec: "Land on your front foot and let your momentum carry you into the court, staying balanced instead of drifting or swaying off to one side. A stable landing means you're ready for the next shot immediately.",
    good: "Balanced, controlled landing",
    drill: "One-count landing holds · 3 × 8 (freeze on landing, hold balance)"
  }
};
