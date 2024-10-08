import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const setupPrompt = `
you are a survey summarizer. You will take a list of survey questions and provide a shorter version of it to the end user. 
your summary should still find a way to keep the general idea and topic of the original list of questions intact. the list should just have contain fewer questions and in a manner that isn't tedious to the end user to answer.
Additionally, your response should also be in json. This is the schema of a question:
export type QuestionType =
  | "mcq"
  | "short_answer"
  | "long_answer"
  | "rating"
  | "checkboxes"
  | "dropdown"
  | "ranking"
  | "date_time"
  | "matrix"
  | "slider"
  | "file_upload"
  | "yes_no"
  | "image_choice";

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string; //the text of the actual question
  required: boolean;
  segment_id: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  options: string[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: "short_answer";
}

export interface LongAnswerQuestion extends BaseQuestion {
  type: "long_answer";
}

export interface RatingQuestion extends BaseQuestion {
  type: "rating";
  maxRating: number;
}

export interface CheckboxesQuestion extends BaseQuestion {
  type: "checkboxes";
  options: string[];
}

export interface DropdownQuestion extends BaseQuestion {
  type: "dropdown";
  options: string[];
}

export interface RankingQuestion extends BaseQuestion {
  type: "ranking";
  options: string[];
}

export interface DateTimeQuestion extends BaseQuestion {
  type: "date_time";
  includeTime: boolean;
}

export interface MatrixQuestion extends BaseQuestion {
  type: "matrix";
  rows: string[];
  columns: string[];
}

export interface SliderQuestion extends BaseQuestion {
  type: "slider";
  min: number;
  max: number;
  step: number;
}

export interface FileUploadQuestion extends BaseQuestion {
  type: "file_upload";
  allowedFileTypes: string[];
}

export interface YesNoQuestion extends BaseQuestion {
  type: "yes_no";
}

export interface ImageChoiceQuestion extends BaseQuestion {
  type: "image_choice";
  options: { imageUrl: string; label: string }[];
}

export type Question =
  | MCQQuestion
  | ShortAnswerQuestion
  | LongAnswerQuestion
  | RatingQuestion
  | CheckboxesQuestion
  | DropdownQuestion
  | RankingQuestion
  | DateTimeQuestion
  | MatrixQuestion
  | SliderQuestion
  | FileUploadQuestion
  | YesNoQuestion
  | ImageChoiceQuestion;
`;

export async function POST(req) {
  const data = await req.text();
  console.log(data);

  const model = genAi.getGenerativeModel({ model: "gemini-pro" });

  try {
    const result = await model.generateContent([setupPrompt, data]);
    const text = result.response.text();
    console.log(text);

    return NextResponse.json(text);
  } catch (error) {
    console.error("Error generating: ", error);
    return NextResponse.json({ error: "error generating" }, { status: 500 });
  }
}
