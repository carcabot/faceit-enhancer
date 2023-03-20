import select from 'select-dom'
import React from 'dom-chef'
import { CACHE_TIME, getSelf } from '../helpers/faceit-api'
import {
  hasFeatureAttribute,
  setFeatureAttribute
} from '../helpers/dom-element'
import { LEVELS } from '../helpers/elo'
import createSkillLevelElement from '../components/skill-level'
import { isLoggedIn } from '../helpers/user'

const FEATURE_ATTRIBUTE = 'level-progress'
const REFRESH_TIME = CACHE_TIME + 15000

export default async () => {
  if (!isLoggedIn()) {
    return
  }

  const mainHeaderActionsElement = select('parasite-main-header-actions')

  if (!mainHeaderActionsElement) {
    return
  }

  const parasiteRootElement = select(
    '#__next',
    mainHeaderActionsElement.shadowRoot
  )

  if (!parasiteRootElement) {
    return
  }

  const targetElement = parasiteRootElement.firstElementChild?.lastElementChild

  if (!targetElement) {
    return
  }

  if (hasFeatureAttribute(FEATURE_ATTRIBUTE, targetElement)) {
    return
  }
  setFeatureAttribute(FEATURE_ATTRIBUTE, targetElement)

  let levelElement

  const addLevelElement = async () => {
    const self = await getSelf()

    if (!self) {
      return
    }

    const { flag: game, games } = self
    const { skillLevel, faceitElo = 1000 } = games[game]
    const [levelMinElo, levelMaxElo] = LEVELS[skillLevel]

    const progressWidth = levelMaxElo
      ? `${((faceitElo - levelMinElo) / (levelMaxElo - levelMinElo)) * 100}%`
      : '100%'

    const levelBelow = LEVELS[skillLevel - 1]
    const levelAbove = LEVELS[skillLevel + 1]

    const levelBelowEloDiff = levelBelow ? `-${faceitElo - levelBelow[1]}` : 0
    const levelAboveEloDiff = levelMaxElo
      ? `+${levelAbove[0] - faceitElo}`
      : '∞'

    levelElement = (
      <>
        <div
          style={{
            width: 1,
            background: '#404040',
            marginLeft: 16,
            marginRight: 16
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            alignItems: 'center'
          }}
        >
          <div style={{ 'margin-right': 4 }}>
            <div
              style={{
                display: 'flex',
                'justify-content': 'space-between',
                alignItems: 'flex-end'
              }}
            >
              <div>{game.toUpperCase()}</div>
              <div
                style={{
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'flex-end',
                  fontSize: 14,
                  gap: 4
                }}
              >
                {faceitElo}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  fill="none"
                  color="secondary"
                  viewBox="0 0 24 12"
                >
                  <path
                    fill="rgba(255,255,255,0.6)"
                    d="M12 3c0 .463-.105.902-.292 1.293l1.998 2A2.97 2.97 0 0 1 15 6a2.99 2.99 0 0 1 1.454.375l1.921-1.921a3 3 0 1 1 1.5 1.328l-2.093 2.093a3 3 0 1 1-5.49-.168l-1.999-2a2.992 2.992 0 0 1-2.418.074L5.782 7.876a3 3 0 1 1-1.328-1.5l1.921-1.921A3 3 0 1 1 12 3z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <div
                style={{
                  marginTop: 1,
                  height: 2,
                  width: 110,
                  background: '#4b4e4e'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: progressWidth,
                    background: '#f50'
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  'justify-content': 'space-between'
                }}
              >
                {levelMinElo}
                <span>
                  {levelBelowEloDiff}/{levelAboveEloDiff}
                </span>
                <span>{levelMaxElo ? levelMaxElo : '∞'}</span>
              </div>
            </div>
          </div>
          {createSkillLevelElement({
            level: skillLevel
          })}
        </div>
      </>
    )

    targetElement.insertBefore(levelElement, targetElement.children[1])
  }

  addLevelElement()

  setInterval(() => {
    levelElement.remove()
    addLevelElement()
  }, REFRESH_TIME)
}
