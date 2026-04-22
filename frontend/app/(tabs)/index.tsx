import { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { sayHello } from '../../lib/api'

export default function HomeScreen() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handlePress() {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const data = await sayHello('Başak')
      setMessage(data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Applyze</Text>
      <Text style={styles.subtitle}>Backend bağlantı testi</Text>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Backend'i çağır</Text>}
      </TouchableOpacity>

      {message && <Text style={styles.message}>{message}</Text>}
      {error && <Text style={styles.error}>Hata: {error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#0F6E56' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 6, marginBottom: 32 },
  button: { backgroundColor: '#0F6E56', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10, minHeight: 44 },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  message: { marginTop: 24, fontSize: 16, color: '#0F6E56', textAlign: 'center' },
  error: { marginTop: 24, fontSize: 14, color: '#DC2626' },
})