import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [rows]: any = await pool.query('SELECT * FROM pets WHERE id = ?', [params.id]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching pet:', error);
    return NextResponse.json({ error: 'Failed to fetch pet' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, species, category, age, description, image_url } = body;
    
    const [result]: any = await pool.query(
      'UPDATE pets SET name = ?, species = ?, category = ?, age = ?, description = ?, image_url = ? WHERE id = ?',
      [name, species, category, age, description || '', image_url || '', params.id]
    );
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }
    
    const [rows]: any = await pool.query('SELECT * FROM pets WHERE id = ?', [params.id]);
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating pet:', error);
    return NextResponse.json({ error: 'Failed to update pet' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [result]: any = await pool.query('DELETE FROM pets WHERE id = ?', [params.id]);
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    return NextResponse.json({ error: 'Failed to delete pet' }, { status: 500 });
  }
}
