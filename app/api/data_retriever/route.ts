import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const data = await request.formData();

    const file = data.get('file');
    if (!(file instanceof Blob)) {
        // Handle error, file is not of type Blob
        return NextResponse.error();
    }

    console.log(file.type)

    // Check if the file is a CSV or PDF
    let docs : any;
    if (file.type === 'text/csv') {
        const loader = new CSVLoader(file);
        docs = await loader.load();
    } else if (file.type === 'application/pdf') {
        const loader = new PDFLoader(file);
        docs = await loader.load();
    } else if (file.type === 'application/json') {
        const loader = new JSONLoader(file);
        docs = await loader.load();
    } else {
        // Unsupported file type
        return NextResponse.error();
    }

    return NextResponse.json({ data: docs });
}