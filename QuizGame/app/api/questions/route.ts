import { NextResponse } from 'next/server';

interface OtdbQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface OtdbResponse {
  response_code: number;
  results: OtdbQuestion[];
}

/** Decode HTML entities returned by Open Trivia DB. */
function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lrm;/g, '')
    .replace(/&rlm;/g, '')
    .replace(/&hellip;/g, '…')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019');
}

/** Shuffle an array in-place using Fisher-Yates. */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = parseInt(searchParams.get('amount') || '10', 10);

    const url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
    
    // Retry logic for rate limiting
    let res;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await fetch(url);
        
        if (res.ok || res.status === 200) {
          break;
        }
        
        // Rate limit or service unavailable, retry after delay
        if ((res.status === 429 || res.status === 503) && attempt < 2) {
          console.warn(`OpenTDB returned ${res.status}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!res) {
      throw lastError || new Error('Failed to fetch from OpenTDB');
    }

    if (!res.ok) {
      console.error(`OpenTDB API returned ${res.status}`);
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const data: OtdbResponse = await res.json();

    // Handle OpenTDB error codes
    if (data.response_code === 5) {
      // Rate limited
      console.warn('OpenTDB rate limited (code 5)');
      return NextResponse.json({ error: 'Too many requests, please try again later' }, { status: 429 });
    }

    if (data.response_code !== 0 || !data.results || data.results.length === 0) {
      console.warn(`OpenTDB response code: ${data.response_code}, results: ${data.results?.length || 0}`);
      return NextResponse.json({ error: 'No questions available right now' }, { status: 503 });
    }

    const questions = data.results.map((q) => {
      const correct = decodeEntities(q.correct_answer);
      const incorrects = q.incorrect_answers.map(decodeEntities);
      const all = shuffle([correct, ...incorrects]);
      const correctIndex = all.indexOf(correct);
      return {
        category: decodeEntities(q.category),
        question: decodeEntities(q.question),
        answers: all,
        correctIndex,
      };
    });

    return NextResponse.json(questions);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Questions API error:', errorMsg);
    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 503 }
    );
  }
}
