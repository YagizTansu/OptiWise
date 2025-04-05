import { supabase } from './supabase';

export const getFavorites = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return [];
  }
  
  const { data, error } = await supabase
    .from('favorites')
    .select('symbol')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
  
  return data.map(item => item.symbol);
};

export const addToFavorites = async (symbol: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return false;
  }
  
  const { data, error } = await supabase
    .from('favorites')
    .insert([{ 
      symbol,
      user_id: user.id 
    }]);
    
  if (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
  
  return true;
};

export const removeFromFavorites = async (symbol: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return false;
  }
  
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('symbol', symbol)
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
  
  return true;
};

export const isFavorite = async (symbol: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return false;
  }
  
  const { data, error } = await supabase
    .from('favorites')
    .select('symbol')
    .eq('symbol', symbol)
    .eq('user_id', user.id)
    .maybeSingle();
    
  if (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
  
  return !!data;
};
