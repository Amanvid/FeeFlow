import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from 'react-native'
import axios from 'axios'
import { apiUrl } from '../../constants/api'

type Record = {
  id: string
  studentName: string
  totalClassScore: number | string
  scaledClassScore: number | string
  scaledExamScore: number | string
  overallTotal: number | string
  position: number | string
}

export default function SBAAssessmentView() {
  const [className, setClassName] = useState('')
  const [subject, setSubject] = useState('')
  const [term, setTerm] = useState('')
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setError('')
    if (!className || !subject || !term) {
      setError('Enter class, subject and term')
      return
    }
    setLoading(true)
    try {
      const res = await axios.get(
        apiUrl(`/sba/class-assessment?className=${encodeURIComponent(className)}&subject=${encodeURIComponent(subject)}&term=${encodeURIComponent(term)}`)
      )
      if (res.data?.success) {
        setRecords(res.data?.records || [])
      } else {
        setError('Failed to load assessment data')
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load assessment data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white px-6 pt-24" style={styles.screen}>
      <Text className="text-2xl font-bold text-gray-900 mb-8" style={styles.title}>SBA Assessment</Text>
      <View className="space-y-3 mb-4" style={styles.form}>
        <TextInput value={className} onChangeText={setClassName} placeholder="Class (e.g., BS 2)" className="border border-gray-300 rounded-xl px-4 py-3" style={styles.input} />
        <TextInput value={subject} onChangeText={setSubject} placeholder="Subject (e.g., Literacy)" className="border border-gray-300 rounded-xl px-4 py-3" style={styles.input} />
        <TextInput value={term} onChangeText={setTerm} placeholder="Term (1 | 2 | 3)" className="border border-gray-300 rounded-xl px-4 py-3" style={styles.input} />
        {error ? <Text className="text-red-600" style={styles.error}>{error}</Text> : null}
        <TouchableOpacity onPress={fetchData} className="bg-blue-600 rounded-xl py-4 active:bg-blue-700" style={styles.button}>
          <Text className="text-white text-center font-semibold" style={styles.buttonText}>Load Assessment</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View className="items-center" style={styles.center}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="border border-gray-200 rounded-xl p-4 mb-3" style={styles.card}>
              <Text className="font-semibold" style={styles.name}>{item.studentName}</Text>
              <Text className="text-gray-600 mt-1" style={styles.meta}>Total: {item.overallTotal} | Position: {item.position}</Text>
            </View>
          )}
          ListEmptyComponent={<Text className="text-gray-500" style={styles.empty}>No records</Text>}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24, paddingTop: 96 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 24 },
  form: {},
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  error: { color: '#dc2626' },
  button: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  center: { alignItems: 'center' },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginBottom: 12 },
  name: { fontWeight: '600' },
  meta: { color: '#6b7280', marginTop: 4 },
  empty: { color: '#6b7280' },
})
