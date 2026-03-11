import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  try {
    let query = 'SELECT * FROM pets';
    const params: string[] = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY id DESC';
    
    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching pets:', error);
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, species, category, age, description, image_url } = body;
    
    const [result]: any = await pool.query(
      'INSERT INTO pets (name, species, category, age, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, species, category || 'food', age, description || '', image_url || '']
    );
    
    const [rows]: any = await pool.query('SELECT * FROM pets WHERE id = ?', [result.insertId]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating pet:', error);
    return NextResponse.json({ error: 'Failed to create pet' }, { status: 500 });
  }
}
