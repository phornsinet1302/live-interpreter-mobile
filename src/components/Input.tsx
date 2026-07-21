import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing, typography } from '@/utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export function Input({
  label,
  icon,
  error,
  containerStyle,
  isPassword,
  style,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(!!isPassword);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.accent : colors.textFaint}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textFaint}
          secureTextEntry={secure}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {isPassword ? (
          <Ionicons
            name={secure ? 'eye-outline' : 'eye-off-outline'}
            size={18}
            color={colors.textFaint}
            onPress={() => setSecure((s) => !s)}
            suppressHighlighting
          />
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.label, marginBottom: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  fieldFocused: { borderColor: colors.accent, backgroundColor: colors.backgroundElevated },
  fieldError: { borderColor: colors.danger },
  icon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: 15,
    paddingVertical: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
