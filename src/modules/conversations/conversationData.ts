import type { Difficulty } from '../../types/exercise';

export type ConversationOutcome = 'best' | 'acceptable' | 'retry';

export interface ConversationChoice {
  text: string;
  feedback: string;
  outcome: ConversationOutcome;
  nextStep?: string;
}

export interface ConversationStep {
  id: string;
  speaker: string;
  message: string;
  choices: ConversationChoice[];
}

export interface ConversationScenario {
  id: string;
  title: string;
  icon: string;
  context: string;
  difficulty: Difficulty;
  startStep: string;
  steps: ConversationStep[];
}

const choice = (
  text: string,
  feedback: string,
  outcome: ConversationOutcome,
  nextStep?: string,
): ConversationChoice => ({ text, feedback, outcome, nextStep });

export const conversationScenarios: ConversationScenario[] = [
  {
    id: 'introductions',
    title: 'Introducing yourself',
    icon: '👋',
    difficulty: 'easy',
    context: 'Meet a new neighbour.',
    startStep: 'hello',
    steps: [
      {
        id: 'hello',
        speaker: 'Buurvrouw',
        message: 'Hoi! Ik ben Noor. Hoe heet jij?',
        choices: [
          choice('Ik heet Sam. Leuk je te ontmoeten!', 'Natural and friendly.', 'best', 'origin'),
          choice(
            'Mijn naam Sam.',
            'Understandable, but “Mijn naam is Sam” needs is.',
            'retry',
            'repair',
          ),
          choice('Ik ben goed.', 'That answers how you are, not your name.', 'retry', 'repair'),
        ],
      },
      {
        id: 'repair',
        speaker: 'Buurvrouw',
        message: 'Sorry, hoe is je naam?',
        choices: [
          choice('Mijn naam is Sam.', 'Good repair.', 'best', 'origin'),
          choice('Tot ziens!', 'This ends the conversation too early.', 'retry'),
        ],
      },
      {
        id: 'origin',
        speaker: 'Buurvrouw',
        message: 'Leuk je te ontmoeten, Sam. Waar kom je vandaan?',
        choices: [
          choice(
            'Ik kom uit Portugal, maar ik woon nu in Nederland.',
            'Complete and natural answer.',
            'best',
          ),
          choice('Uit Portugal.', 'Short but appropriate.', 'acceptable'),
          choice('Ik ben Portugal.', 'Use komen uit for origin.', 'retry'),
        ],
      },
    ],
  },
  {
    id: 'supermarket',
    title: 'At the supermarket',
    icon: '🛒',
    difficulty: 'easy',
    context: 'Ask an employee where something is.',
    startStep: 'help',
    steps: [
      {
        id: 'help',
        speaker: 'Medewerker',
        message: 'Goedemiddag, kan ik u helpen?',
        choices: [
          choice('Ja, waar staat de melk?', 'Clear and polite.', 'best', 'aisle'),
          choice('Melk?', 'Understandable but abrupt.', 'acceptable', 'aisle'),
          choice('Ik melk niet.', 'This does not ask for the product.', 'retry'),
        ],
      },
      {
        id: 'aisle',
        speaker: 'Medewerker',
        message: 'De melk staat achterin, naast de yoghurt.',
        choices: [
          choice('Dank u wel!', 'Perfect closing.', 'best'),
          choice('Oké, bedankt.', 'Friendly and natural.', 'acceptable'),
          choice(
            'Waar is achterin?',
            'A reasonable follow-up when the direction is unclear.',
            'acceptable',
            'clarify',
          ),
        ],
      },
      {
        id: 'clarify',
        speaker: 'Medewerker',
        message: 'Loop rechtdoor tot het einde van deze gang.',
        choices: [
          choice('Dank u, nu begrijp ik het.', 'Good confirmation.', 'best'),
          choice('Tot ziens.', 'Acceptable closing.', 'acceptable'),
        ],
      },
    ],
  },
  {
    id: 'restaurant',
    title: 'At a restaurant',
    icon: '🍽️',
    difficulty: 'easy',
    context: 'Order a drink and a meal.',
    startStep: 'drink',
    steps: [
      {
        id: 'drink',
        speaker: 'Ober',
        message: 'Goedenavond. Wilt u iets drinken?',
        choices: [
          choice('Ja, graag een glas water.', 'Polite order with graag.', 'best', 'food'),
          choice('Water.', 'Understood, but not very polite.', 'acceptable', 'food'),
          choice('Ik ben water.', 'Use graag + the item.', 'retry'),
        ],
      },
      {
        id: 'food',
        speaker: 'Ober',
        message: 'En wat wilt u eten?',
        choices: [
          choice(
            'Ik neem de vegetarische pasta, alstublieft.',
            'Natural restaurant phrasing.',
            'best',
          ),
          choice('Voor mij de pasta.', 'Short and acceptable.', 'acceptable'),
          choice('Waar is de trein?', 'Unrelated to the restaurant.', 'retry'),
        ],
      },
    ],
  },
  {
    id: 'train-station',
    title: 'At the train station',
    icon: '🚆',
    difficulty: 'medium',
    context: 'Buy a ticket and confirm the platform.',
    startStep: 'destination',
    steps: [
      {
        id: 'destination',
        speaker: 'Medewerker',
        message: 'Goedemorgen. Waar wilt u naartoe?',
        choices: [
          choice(
            'Een enkele reis naar Rotterdam, alstublieft.',
            'Includes ticket type and destination.',
            'best',
            'time',
          ),
          choice('Naar Rotterdam.', 'Clear, but the ticket type is missing.', 'acceptable', 'time'),
          choice('Ik ben Rotterdam.', 'Use naar for a destination.', 'retry'),
        ],
      },
      {
        id: 'time',
        speaker: 'Medewerker',
        message: 'Wilt u met de trein van tien uur reizen?',
        choices: [
          choice(
            'Ja, graag. Van welk perron vertrekt die?',
            'Confirms and asks useful information.',
            'best',
            'platform',
          ),
          choice('Ja, dat is goed.', 'Clear confirmation.', 'acceptable', 'platform'),
          choice('Nee, gisteren.', 'Gisteren cannot be a future departure.', 'retry'),
        ],
      },
      {
        id: 'platform',
        speaker: 'Medewerker',
        message: 'De trein vertrekt van perron zes.',
        choices: [
          choice('Bedankt voor uw hulp.', 'Polite closing.', 'best'),
          choice('Dank u.', 'Correct and concise.', 'acceptable'),
        ],
      },
    ],
  },
  {
    id: 'directions',
    title: 'Asking for directions',
    icon: '🗺️',
    difficulty: 'medium',
    context: 'Find the town hall.',
    startStep: 'ask',
    steps: [
      {
        id: 'ask',
        speaker: 'Voorbijganger',
        message: 'Hallo, zoekt u iets?',
        choices: [
          choice(
            'Ja, kunt u mij vertellen waar het gemeentehuis is?',
            'Polite and specific.',
            'best',
            'route',
          ),
          choice('Waar gemeentehuis?', 'Understandable but incomplete.', 'acceptable', 'route'),
          choice('Ik heb gemeentehuis.', 'This does not ask for a location.', 'retry'),
        ],
      },
      {
        id: 'route',
        speaker: 'Voorbijganger',
        message: 'Ga rechtdoor en sla bij het stoplicht linksaf.',
        choices: [
          choice('Is het ver lopen?', 'A useful follow-up.', 'best', 'distance'),
          choice('Rechtdoor en dan links, bedankt.', 'Good confirmation.', 'acceptable'),
          choice('Ik wil rechts.', 'This contradicts the direction.', 'retry'),
        ],
      },
      {
        id: 'distance',
        speaker: 'Voorbijganger',
        message: 'Nee, het is ongeveer vijf minuten lopen.',
        choices: [
          choice('Prima, hartelijk dank!', 'Friendly closing.', 'best'),
          choice('Oké, bedankt.', 'Natural closing.', 'acceptable'),
        ],
      },
    ],
  },
  {
    id: 'workplace',
    title: 'At the workplace',
    icon: '💼',
    difficulty: 'medium',
    context: 'Ask a colleague about a meeting.',
    startStep: 'meeting',
    steps: [
      {
        id: 'meeting',
        speaker: 'Collega',
        message: 'Heb je straks tijd voor de vergadering?',
        choices: [
          choice(
            'Ja, hoe laat begint de vergadering?',
            'Good request for detail.',
            'best',
            'schedule',
          ),
          choice(
            'Ja, ik heb tijd.',
            'Clear but does not confirm the time.',
            'acceptable',
            'schedule',
          ),
          choice('Ik tijd niet.', 'Use Ik heb geen tijd.', 'retry'),
        ],
      },
      {
        id: 'schedule',
        speaker: 'Collega',
        message: 'We beginnen om half drie in kamer vier.',
        choices: [
          choice('Prima, ik zet het in mijn agenda.', 'Natural workplace response.', 'best'),
          choice('Tot half drie!', 'Acceptable confirmation.', 'acceptable'),
          choice(
            'Kunnen we een kwartier later beginnen?',
            'A valid request that creates another branch.',
            'acceptable',
            'reschedule',
          ),
        ],
      },
      {
        id: 'reschedule',
        speaker: 'Collega',
        message: 'Ja, ik laat de anderen weten dat we later beginnen.',
        choices: [
          choice('Dank je, dat helpt enorm.', 'Polite and appreciative.', 'best'),
          choice('Goed.', 'Acceptable but terse.', 'acceptable'),
        ],
      },
    ],
  },
  {
    id: 'doctor',
    title: 'At the doctor',
    icon: '🩺',
    difficulty: 'hard',
    context: 'Explain a simple health complaint.',
    startStep: 'complaint',
    steps: [
      {
        id: 'complaint',
        speaker: 'Dokter',
        message: 'Goedemorgen. Wat kan ik voor u doen?',
        choices: [
          choice(
            'Ik heb sinds gisteren keelpijn en koorts.',
            'Clear symptoms and duration.',
            'best',
            'severity',
          ),
          choice('Mijn keel doet pijn.', 'Clear but less detailed.', 'acceptable', 'severity'),
          choice('Ik ben een keel.', 'Use Ik heb keelpijn or Mijn keel doet pijn.', 'retry'),
        ],
      },
      {
        id: 'severity',
        speaker: 'Dokter',
        message: 'Hoe hoog is de koorts en kunt u goed drinken?',
        choices: [
          choice(
            'Ongeveer 38,5 graden. Drinken gaat wel.',
            'Answers both questions clearly.',
            'best',
            'advice',
          ),
          choice(
            'De koorts is 38,5 graden.',
            'Answers the first question.',
            'acceptable',
            'advice',
          ),
          choice('Ja, gisteren koorts.', 'This does not clearly answer either question.', 'retry'),
        ],
      },
      {
        id: 'advice',
        speaker: 'Dokter',
        message: 'Neem rust en bel terug als het erger wordt.',
        choices: [
          choice('Dank u. Wanneer moet ik precies terugbellen?', 'Good clarification.', 'best'),
          choice('Dank u wel, dat zal ik doen.', 'Good closing.', 'acceptable'),
        ],
      },
    ],
  },
  {
    id: 'municipality',
    title: 'At the municipality',
    icon: '🏛️',
    difficulty: 'hard',
    context: 'Ask about registering an address.',
    startStep: 'purpose',
    steps: [
      {
        id: 'purpose',
        speaker: 'Medewerker',
        message: 'Goedemiddag. Waarmee kan ik u helpen?',
        choices: [
          choice(
            'Ik wil mij graag op mijn nieuwe adres inschrijven.',
            'Clear, polite purpose.',
            'best',
            'documents',
          ),
          choice(
            'Ik heb een nieuw adres.',
            'Relevant but the requested action is missing.',
            'acceptable',
            'documents',
          ),
          choice('Mijn adres wil mij.', 'The word order and subject are incorrect.', 'retry'),
        ],
      },
      {
        id: 'documents',
        speaker: 'Medewerker',
        message: 'Heeft u een identiteitsbewijs en uw huurcontract bij u?',
        choices: [
          choice(
            'Mijn identiteitsbewijs wel, maar mijn huurcontract heb ik digitaal.',
            'Complete and precise.',
            'best',
            'digital',
          ),
          choice('Ja, die heb ik bij me.', 'Clear if both are present.', 'acceptable'),
          choice('Nee, ik ben identiteitsbewijs.', 'Use ik heb, not ik ben.', 'retry'),
        ],
      },
      {
        id: 'digital',
        speaker: 'Medewerker',
        message: 'U kunt het digitale huurcontract naar ons e-mailadres sturen.',
        choices: [
          choice(
            'Prima. Kunt u het e-mailadres voor mij opschrijven?',
            'Useful clarification.',
            'best',
          ),
          choice('Dat doe ik meteen, bedankt.', 'Good closing.', 'acceptable'),
        ],
      },
    ],
  },
];

export function findConversationStep(
  scenario: ConversationScenario,
  stepId: string,
): ConversationStep {
  const step = scenario.steps.find((candidate) => candidate.id === stepId);
  if (!step) throw new Error(`Unknown conversation step ${stepId} in ${scenario.id}`);
  return step;
}
