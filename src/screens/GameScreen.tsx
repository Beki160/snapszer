import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { HungarianCard } from '../components/HungarianCard';
import { playComputerTurn } from '../game/ai';
import {
  canClaimSixtySix,
  canContinueAfterTrick,
  canDeclareMarriageWithCard,
  canExchangeTrump,
  canUserDraw,
  canUserPlay,
  claimSixtySix,
  continueAfterTrick,
  drawCard,
  exchangeTrump,
  hasDrawableCards,
  isCardPlayable,
  isMarriageHighlightCard,
  marriagePointsForSuit,
  playCard,
} from '../game/engine';
import {
  COMPUTER_DRAW_DELAY_MS,
  COMPUTER_MOVE_DELAY_MS,
  GameState,
  SUIT_LABELS,
} from '../game/types';

type ConfirmAction =
  | { type: 'marriage'; cardId: string; value: number }
  | { type: 'exchange' };

type Props = {
  state: GameState;
  onChange: (next: GameState) => void;
  onExitToMenu: () => void;
  onNewGame: () => void;
  onContinueMatch: () => void;
  onNewMatch: () => void;
  computerDelayMs?: number;
  computerDrawDelayMs?: number;
};

export function GameScreen({
  state,
  onChange,
  onExitToMenu,
  onNewGame,
  onContinueMatch,
  onNewMatch,
  computerDelayMs = COMPUTER_MOVE_DELAY_MS,
  computerDrawDelayMs = COMPUTER_DRAW_DELAY_MS,
}: Props) {
  const stateRef = useRef(state);
  stateRef.current = state;
  const { width: screenWidth } = useWindowDimensions();
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  const handCardWidth = useMemo(() => {
    const sidePadding = 40;
    const gaps = 4 * 6;
    return Math.max(48, Math.min(64, (screenWidth - sidePadding - gaps) / 5));
  }, [screenWidth]);
  const handCardHeight = Math.round(handCardWidth * 1.61);
  const trickCardWidth = Math.min(66, handCardWidth + 4);
  const trickCardHeight = Math.round(trickCardWidth * 1.61);

  useEffect(() => {
    if (state.phase !== 'playing' || state.currentPlayer !== 'computer') {
      return;
    }
    if (state.currentTrick.length >= 2) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        onChange(playComputerTurn(stateRef.current));
      } catch {
        // ignore
      }
    }, computerDelayMs);

    return () => clearTimeout(timer);
    // trumpCard változhat aducsere után — emiatt újra kell lépnie a gépnek
  }, [
    state.phase,
    state.currentPlayer,
    state.currentTrick.length,
    state.trumpCard?.id,
    state.message,
    computerDelayMs,
    onChange,
  ]);

  useEffect(() => {
    if (state.phase !== 'awaitingDraw' || state.drawPlayer !== 'computer') {
      return;
    }

    const timer = setTimeout(() => {
      try {
        onChange(drawCard(stateRef.current, 'computer'));
      } catch {
        // ignore
      }
    }, computerDrawDelayMs);

    return () => clearTimeout(timer);
  }, [state.phase, state.drawPlayer, state.stock.length, state.trumpCard, computerDrawDelayMs, onChange]);

  const userMayPlay = canUserPlay(state);
  const userMayDraw = canUserDraw(state);
  const mayContinue = canContinueAfterTrick(state);
  const showStop66 = canClaimSixtySix(state);
  const userMayExchange = canExchangeTrump(state, 'user');
  const userCardInTrick = state.currentTrick.find((p) => p.player === 'user')?.card;
  const computerCardInTrick = state.currentTrick.find((p) => p.player === 'computer')?.card;
  const showStock = hasDrawableCards(state);

  const askExchangeTrump = () => {
    if (!userMayExchange) return;
    setConfirm({ type: 'exchange' });
  };

  const closeConfirm = () => setConfirm(null);

  const confirmDialog =
    confirm?.type === 'marriage' ? (
      <ConfirmDialog
        visible
        title={`Bemondod a ${confirm.value}-et?`}
        message={`Kijátsszad a ${confirm.value}-et ezzel a párral?`}
        confirmLabel="Igen"
        cancelLabel="Mégsem"
        onCancel={closeConfirm}
        onConfirm={() => {
          const cardId = confirm.cardId;
          closeConfirm();
          onChange(
            playCard(stateRef.current, 'user', cardId, { declareMarriage: true }),
          );
        }}
      />
    ) : confirm?.type === 'exchange' ? (
      <ConfirmDialog
        visible
        title="Adu csere"
        message="Ki szeretnéd cserélni a felfordított adut az alsóddal?"
        confirmLabel="Igen, cseréljem"
        cancelLabel="Nem"
        onCancel={closeConfirm}
        onConfirm={() => {
          closeConfirm();
          onChange(exchangeTrump(stateRef.current, 'user'));
        }}
      />
    ) : null;

  if (
    state.phase === 'gameOver' ||
    state.phase === 'matchRoundOver' ||
    state.phase === 'matchOver'
  ) {
    const isMatchRound = state.phase === 'matchRoundOver';
    const isMatchOver = state.phase === 'matchOver';

    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.gameOver}>
          <Text style={styles.gameOverTitle}>{state.message}</Text>
          {state.endDetail ? (
            <Text style={styles.endDetail}>{state.endDetail}</Text>
          ) : null}
          {!isMatchRound && !isMatchOver ? (
            <Text style={styles.scoreLine}>
              Játszma — Te: {state.userPoints} · Gép: {state.computerPoints}
            </Text>
          ) : null}
          {isMatchOver ? (
            <Text style={styles.scoreLine}>
              Parti — Te: {state.userMatchPoints} · Gép: {state.computerMatchPoints}
            </Text>
          ) : null}

          {isMatchRound ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Következő játék"
              style={({ pressed }) => [styles.newGameBtn, pressed && styles.newGamePressed]}
              onPress={onContinueMatch}
            >
              <Text style={styles.newGameText}>Következő játék</Text>
            </Pressable>
          ) : isMatchOver ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Új parti"
              style={({ pressed }) => [styles.newGameBtn, pressed && styles.newGamePressed]}
              onPress={onNewMatch}
            >
              <Text style={styles.newGameText}>Új parti</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Új játék"
              style={({ pressed }) => [styles.newGameBtn, pressed && styles.newGamePressed]}
              onPress={onNewGame}
            >
              <Text style={styles.newGameText}>Új játék</Text>
            </Pressable>
          )}

          <Pressable onPress={onExitToMenu} style={styles.menuLink}>
            <Text style={styles.menuLinkText}>Vissza a menübe</Text>
          </Pressable>
        </View>
        {confirmDialog}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.topBar}>
        <Pressable onPress={onExitToMenu} accessibilityRole="button">
          <Text style={styles.back}>← Menü</Text>
        </Pressable>
        <Text style={styles.meta}>
          {state.mode === 'match'
            ? `Parti ${state.userMatchPoints}:${state.computerMatchPoints}`
            : `Játszma #${state.gamesStarted}`}
          {state.trumpSuit ? ` · Adu: ${SUIT_LABELS[state.trumpSuit]}` : ''}
        </Text>
      </View>

      <Text style={styles.scoreBar}>
        Pontok — Te: {state.userPoints}
        {state.userPendingMarriage > 0
          ? ` (+${state.userPendingMarriage} pár)`
          : ''}
        {' · '}
        Gép: {state.computerPoints}
        {state.computerPendingMarriage > 0
          ? ` (+${state.computerPendingMarriage} pár)`
          : ''}
      </Text>

      <View style={styles.computerZone}>
        <Text style={styles.zoneLabel}>Gép ({state.computerHand.length})</Text>
        <View style={styles.computerCards}>
          {state.computerHand.map((card) => (
            <View key={card.id} style={styles.computerCardSlot}>
              <HungarianCard card={card} faceDown width={36} height={58} />
            </View>
          ))}
        </View>
      </View>

      <Pressable
        style={styles.table}
        disabled={!mayContinue}
        onPress={() => onChange(continueAfterTrick(state))}
        accessibilityRole={mayContinue ? 'button' : undefined}
        accessibilityLabel={mayContinue ? 'Folytatás' : undefined}
      >
        <View style={styles.trickArea}>
          <View style={styles.trickSlot}>
            <Text style={styles.trickLabel}>Gép</Text>
            {computerCardInTrick ? (
              <HungarianCard
                card={computerCardInTrick}
                width={trickCardWidth}
                height={trickCardHeight}
              />
            ) : (
              <View
                style={[
                  styles.trickPlaceholder,
                  { width: trickCardWidth, height: trickCardHeight },
                ]}
              />
            )}
          </View>

          <View style={styles.trickSlot}>
            <Text style={styles.trickLabel}>Te</Text>
            {userCardInTrick ? (
              <HungarianCard
                card={userCardInTrick}
                width={trickCardWidth}
                height={trickCardHeight}
              />
            ) : (
              <View
                style={[
                  styles.trickPlaceholder,
                  { width: trickCardWidth, height: trickCardHeight },
                ]}
              />
            )}
          </View>
        </View>

        <View style={styles.stockColumn}>
          <Pressable
            disabled={!userMayDraw}
            accessibilityRole="button"
            accessibilityLabel="Húzás a pakliból"
            onPress={() => onChange(drawCard(state, 'user'))}
            style={({ pressed }) => [
              styles.stockStack,
              userMayDraw && styles.stockHighlight,
              pressed && userMayDraw && styles.stockPressed,
            ]}
          >
            {showStock ? (
              state.stock.length > 0 ? (
                <HungarianCard card={state.stock[0]} faceDown width={52} height={84} />
              ) : state.trumpCard ? (
                <HungarianCard card={state.trumpCard} width={52} height={84} />
              ) : (
                <View style={styles.emptyStock} />
              )
            ) : (
              <View style={styles.emptyStock} />
            )}
            <Text style={styles.stockCount}>
              {state.stock.length + (state.trumpCard ? 1 : 0)}
            </Text>
            {userMayDraw ? <Text style={styles.drawHint}>Húzz!</Text> : null}
          </Pressable>

          {state.trumpCard && state.stock.length > 0 ? (
            <View style={styles.trumpWrap}>
              <Text style={styles.trumpLabel}>Adu</Text>
              <Pressable
                disabled={!userMayExchange}
                onPress={askExchangeTrump}
                accessibilityRole="button"
                accessibilityLabel="Adu csere"
                style={({ pressed }) => [
                  userMayExchange && styles.trumpExchangeable,
                  pressed && userMayExchange && styles.stockPressed,
                ]}
              >
                <HungarianCard card={state.trumpCard} width={52} height={84} />
              </Pressable>
              {userMayExchange ? (
                <Text style={styles.exchangeHint}>Csere?</Text>
              ) : null}
            </View>
          ) : state.trumpCard && state.stock.length === 0 ? (
            <Text style={styles.trumpOnlyHint}>Utolsó: adu</Text>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.bottomPanel}>
        <Text style={styles.message}>{state.message}</Text>

        {showStop66 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Megállok 66 ponttal"
            style={({ pressed }) => [styles.stop66Btn, pressed && styles.newGamePressed]}
            onPress={() => onChange(claimSixtySix(state))}
          >
            <Text style={styles.stop66Text}>Megállok 66 ponttal</Text>
          </Pressable>
        ) : null}

        <View style={styles.hand}>
          {state.userHand.map((card) => {
            const playable =
              userMayPlay && isCardPlayable(state, 'user', card.id);
            const showDimmed = userMayPlay && !playable;
            const marriageHighlight =
              userMayPlay && isMarriageHighlightCard(state, 'user', card.id);

            const onPressCard = () => {
              if (
                canDeclareMarriageWithCard(state, 'user', card.id) &&
                state.trumpSuit
              ) {
                const value = marriagePointsForSuit(card.suit, state.trumpSuit);
                setConfirm({ type: 'marriage', cardId: card.id, value });
                return;
              }
              onChange(playCard(state, 'user', card.id));
            };

            return (
              <Pressable
                key={card.id}
                disabled={!playable}
                accessibilityRole="button"
                accessibilityLabel={`Kijátszás: ${card.id}`}
                onPress={onPressCard}
                style={({ pressed }) => [
                  styles.handCard,
                  pressed && playable && styles.handCardPressed,
                ]}
              >
                <HungarianCard
                  card={card}
                  width={handCardWidth}
                  height={handCardHeight}
                  dimmed={showDimmed}
                  highlighted={marriageHighlight}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
      {confirmDialog}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1B4D3E',
    paddingTop: 48,
    paddingBottom: Platform.OS === 'android' ? 72 : 40,
    paddingHorizontal: 16,
  },
  bottomPanel: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  back: {
    color: '#E8D9B5',
    fontSize: 16,
  },
  meta: {
    color: '#D7C7A1',
    fontSize: 13,
  },
  scoreBar: {
    textAlign: 'center',
    color: '#C9B896',
    fontSize: 13,
    marginBottom: 6,
  },
  computerZone: {
    alignItems: 'center',
    marginBottom: 8,
  },
  zoneLabel: {
    color: '#C9B896',
    marginBottom: 6,
    fontSize: 13,
  },
  computerCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  computerCardSlot: {
    marginHorizontal: 2,
  },
  table: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  trickArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginRight: 14,
  },
  trickSlot: {
    alignItems: 'center',
    minWidth: 70,
  },
  trickPlaceholder: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
  },
  trickLabel: {
    color: '#E8D9B5',
    fontSize: 12,
    marginBottom: 4,
    minHeight: 16,
  },
  stockColumn: {
    alignItems: 'center',
    gap: 10,
  },
  stockStack: {
    alignItems: 'center',
    borderRadius: 10,
    padding: 4,
  },
  stockHighlight: {
    backgroundColor: 'rgba(212, 160, 23, 0.25)',
    borderWidth: 2,
    borderColor: '#D4A017',
  },
  stockPressed: {
    opacity: 0.85,
  },
  stockCount: {
    color: '#E8D9B5',
    fontSize: 12,
    marginTop: 4,
  },
  drawHint: {
    color: '#F3E6C8',
    fontWeight: '700',
    fontSize: 13,
    marginTop: 2,
  },
  emptyStock: {
    width: 52,
    height: 84,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  trumpWrap: {
    alignItems: 'center',
  },
  trumpLabel: {
    color: '#F3E6C8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  trumpExchangeable: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D4A017',
    padding: 2,
    backgroundColor: 'rgba(212, 160, 23, 0.2)',
  },
  exchangeHint: {
    color: '#D4A017',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  trumpOnlyHint: {
    color: '#C9B896',
    fontSize: 12,
  },
  message: {
    textAlign: 'center',
    color: '#F3E6C8',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
    minHeight: 44,
    paddingHorizontal: 8,
  },
  stop66Btn: {
    alignSelf: 'center',
    backgroundColor: '#F3E6C8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  stop66Text: {
    color: '#1A1408',
    fontSize: 15,
    fontWeight: '700',
  },
  hand: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    marginTop: 2,
    marginBottom: Platform.OS === 'android' ? 12 : 4,
    gap: 6,
  },
  handCard: {
    borderRadius: 8,
  },
  handCardPressed: {
    opacity: 0.9,
    transform: [{ translateY: -8 }],
  },
  gameOver: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gameOverTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#F3E6C8',
    marginBottom: 10,
    textAlign: 'center',
  },
  endDetail: {
    color: '#E8D9B5',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  scoreLine: {
    color: '#C9B896',
    fontSize: 18,
    marginBottom: 28,
  },
  newGameBtn: {
    backgroundColor: '#D4A017',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  newGamePressed: {
    opacity: 0.9,
  },
  newGameText: {
    color: '#1A1408',
    fontSize: 18,
    fontWeight: '700',
  },
  menuLink: {
    marginTop: 18,
  },
  menuLinkText: {
    color: '#E8D9B5',
    fontSize: 15,
  },
});
