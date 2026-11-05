## 시작

```powershell
cd C:\Users\user\Desktop\Deep\frontend
npm install
npm run dev
```

> 위 경로는 프로젝트를 `Deep` 저장소의 `frontend` 폴더에 복사한 경우입니다.

## 기존 프로젝트에 적용

이미 Vite + React 프로젝트가 있다면 압축 파일의 다음 두 파일을 기존 프로젝트에 복사해 덮어쓰면 됩니다.

- `frontend/src/App.tsx`
- `frontend/src/App.css`

`frontend/src/main.tsx`가 `./App.css`를 import하는지 확인하세요. 또는 기존 `main.tsx`에서 CSS import를 추가하면 됩니다.

`package.json`과 `index.html`은 프로젝트를 새로 구성할 때 사용하는 예시입니다. 기존 프로젝트를 유지하려면 덮어쓰지 마세요.

## 주요 기능

- 선형회귀 그래프: 데이터 점 및 예측 직선 표시
- Cost Function: 가중치/편향 영역별 비용을 단계별 색상으로 표시
- 그래프 클릭으로 데이터 추가
- 데이터 표에서 x, y 직접 수정
- 데이터 추가/삭제, 기본값 복원
- 슬라이더로 가중치, 편향 직접 조절
- Learn / Stop / Reset: 경사하강법 반복 학습
- 학습률 조절
- 최소제곱법의 해석적 해 바로 구하기

## 사용된 수식

- 예측: `h(x) = w*x + b`
- 비용: `J(w,b) = (1/2) * Σ(h(x_i)-y_i)^2`
- 편미분: `dJ/dw = Σ((h(x_i)-y_i)*x_i)`, `dJ/db = Σ(h(x_i)-y_i)`
- 경사하강법: `w -= learningRate * dJ/dw`, `b -= learningRate * dJ/db`
