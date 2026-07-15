export type Difficulty = 'easy' | 'medium' | 'hard';

export type ModuleStatus = 'available' | 'coming-soon';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'vocabulary' | 'grammar' | 'skills' | 'review';
  status: ModuleStatus;
  route: string;
}

export interface BaseQuestion {
  id: string;
  moduleId: string;
  difficulty: Difficulty;
  prompt: string;
  hint?: string;
  explanation?: string;
  tags: string[];
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
  acceptedAnswers: string[];
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: string[];
  correctOption: string;
}

export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  tokens: string[];
  correctOrder: string[];
}

export type Question = TextQuestion | MultipleChoiceQuestion | OrderingQuestion;
