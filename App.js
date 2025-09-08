import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Animated } from 'react-native';

export default function App() {
  const levels = {
    lätt: [5, 20],
    medel: [10, 35],
    svår: [20, 50],
  };

  const [level, setLevel] = useState('medel');
  const [target, setTarget] = useState(randomTarget(levels[level]));
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(30); // 30 sekunder per mål
  const [history, setHistory] = useState([]);
  const [bgColor] = useState(new Animated.Value(0));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    if(timer === 0) {
      setFeedback('Tiden är ute! ⏰');
      resetGame();
    }

    return () => clearInterval(interval);
  }, [timer]);

  function randomTarget(range) {
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  }

  const changeBg = (color) => {
    Animated.timing(bgColor, {
      toValue: color,
      duration: 300,
      useNativeDriver: false
    }).start();
  };

  const bgInterpolation = bgColor.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['#fff', '#f8d7da', '#d4edda'] // neutral, fel, rätt
  });

  const checkGuess = () => {
    const num = Number(guess);
    if (!num) {
      Alert.alert('Ogiltig gissning', 'Ange ett nummer!');
      return;
    }

    setAttempts(attempts + 1);

    if (num < target) {
      setFeedback('För lågt! 💪');
      changeBg(1);
    } else if (num > target) {
      setFeedback('För högt! 🔥');
      changeBg(1);
    } else {
      setFeedback(`Rätt! 🎉 Du klarade målet på ${attempts + 1} försök`);
      changeBg(2);

      const points = Math.max(10 - attempts + Math.floor(timer/5), 1); // bonuspoäng för tid
      setScore(score + points);
      setStreak(streak + 1);

      setHistory([...history, { level, target, attempts: attempts + 1, points, streak: streak + 1 }]);
      setTimeout(() => resetGame(), 1000); // ny utmaning automatiskt
    }
    setGuess('');
  };

  const resetGame = (newLevel) => {
    const lvl = newLevel || level;
    setLevel(lvl);
    setTarget(randomTarget(levels[lvl]));
    setGuess('');
    setFeedback('');
    setAttempts(0);
    setTimer(30);
    changeBg(0);
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgInterpolation }]}>
      <Text style={styles.title}>🏋️‍♂️ Pro-Tränings-Gissningsspel</Text>

      <Text style={styles.label}>Välj nivå:</Text>
      <View style={styles.levels}>
        {Object.keys(levels).map(lvl => (
          <Pressable
            key={lvl}
            style={[styles.levelBtn, level === lvl && styles.levelSelected]}
            onPress={() => resetGame(lvl)}
          >
            <Text style={styles.levelText}>{lvl}</Text>
          </Pressable>
        ))}
      </View>

      <Text>Gissa repetitionsmål mellan {levels[level][0]} och {levels[level][1]}</Text>

      <TextInput
        style={styles.input}
        placeholder="Din gissning"
        keyboardType="number-pad"
        value={guess}
        onChangeText={setGuess}
      />

      <Pressable style={styles.btn} onPress={checkGuess}>
        <Text style={styles.btnText}>Gissa!</Text>
      </Pressable>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <Text style={styles.stats}>Försök: {attempts} | Poäng: {score} | Streak: {streak} | Tid: {timer}s</Text>

      <Text style={styles.historyTitle}>Historik:</Text>
      {history.map((h, i) => (
        <Text key={i} style={styles.historyItem}>
          Nivå: {h.level}, Mål: {h.target}, Försök: {h.attempts}, Poäng: {h.points}, Streak: {h.streak}
        </Text>
      ))}

      <Pressable style={[styles.btn, { backgroundColor: '#f194ff' }]} onPress={() => resetGame()}>
        <Text style={styles.btnText}>Ny utmaning</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginTop: 10 },
  levels: { flexDirection: 'row', marginVertical: 10 },
  levelBtn: { borderWidth: 1, borderColor: '#007AFF', padding: 8, marginHorizontal: 5, borderRadius: 6 },
  levelSelected: { backgroundColor: '#007AFF' },
  levelText: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, width: '80%', marginVertical: 10, textAlign: 'center' },
  btn: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, marginVertical: 5, width: '60%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  feedback: { fontSize: 20, fontWeight: '600', marginVertical: 10 },
  stats: { marginVertical: 10 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  historyItem: { fontSize: 14 },
});
