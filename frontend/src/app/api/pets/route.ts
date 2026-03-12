import { NextResponse } from 'next/server';

const API_BASE = 'http://10.224.205.37:8000/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const page = searchParams.get('page') || '0';
  const pageSize = searchParams.get('pageSize') || '6';
  
  try {
    const url = `${API_BASE}/pets?skip=${parseInt(page) * parseInt(pageSize)}&limit=${pageSize}${category ? `&category=${category}` : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching pets:', error);
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE}/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating pet:', error);
    return NextResponse.json({ error: 'Failed to create pet' }, { status: 500 });
  }
}
