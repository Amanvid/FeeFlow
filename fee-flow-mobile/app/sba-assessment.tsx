
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { apiUrl } from '../constants/api';

type Record = {
  id: string;
  name: string;
  [key: string]: any;
};

const SbaAssessmentScreen = () => {
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [term, setTerm] = useState('');
  const [data, setData] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!className || !subject || !term) {
      setError('Please enter class, subject, and term');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(apiUrl, {
        params: { className, subject, term },
      });
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Record }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.name}</Text>
      {/* Add other cells as needed */}
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Class Name"
        value={className}
        onChangeText={setClassName}
      />
      <TextInput
        style={styles.input}
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
      />
      <TextInput
        style={styles.input}
        placeholder="Term"
        value={term}
        onChangeText={setTerm}
      />
      <TouchableOpacity style={styles.button} onPress={fetchData}>
        <Text style={styles.buttonText}>Fetch Data</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" />}
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 12,
      paddingHorizontal: 8,
    },
    button: {
      backgroundColor: '#007BFF',
      padding: 10,
      alignItems: 'center',
      marginBottom: 12,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
    },
    error: {
      color: 'red',
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      paddingVertical: 8,
    },
    cell: {
      flex: 1,
      fontSize: 16,
    },
  });

export default SbaAssessmentScreen;
