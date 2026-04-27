export interface JeopardyQuestion {
	value: number;
	question: string;
	answer: string;
}

export interface JeopardyCategory {
	name: string;
	questions: JeopardyQuestion[];
}

export interface JeopardyBoard {
	title: string;
	categories: JeopardyCategory[];
}
