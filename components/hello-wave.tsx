import Animated from 'react-native-reanimated';
// This component is a simple animated waving hand emoji that can be used in various parts of the app to add a friendly and welcoming touch. The animation rotates the hand back and forth to create a waving effect. It can be used in the login screen, welcome messages, or any other place where you want to greet the user with a wave. The animation is set to repeat a few times to make it more noticeable and engaging.
export function HelloWave() {
  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}
