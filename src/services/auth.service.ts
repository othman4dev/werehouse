import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Warehouseman } from '../types';

class AuthService {
  async login(secretKey: string): Promise<Warehouseman | null> {
    try {
      const response = await api.get('/warehousemans');
      const users = response.data;
      const user = users.find((u: Warehouseman) => u.secretKey === secretKey);
      
      if (user) {
        await this.setUser(user);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('@user');
  }

  async getUser(): Promise<Warehouseman | null> {
    try {
      const userStr = await AsyncStorage.getItem('@user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  private async setUser(user: Warehouseman): Promise<void> {
    await AsyncStorage.setItem('@user', JSON.stringify(user));
  }
}

export default new AuthService(); 