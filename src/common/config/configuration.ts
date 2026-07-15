import { readFileSync } from "fs";
import * as yaml from 'js-yaml';
import { join } from "path";

export default () => {
  // 1. 현재 실행 단계(stage) 확인 (기본값: local)
  const stage = process.env.NODE_ENV || 'local';

  // 2. 해당 stage의 YML 파일 경로 지정
  const YAML_CONFIG_PATH = join(process.cwd(), 'config', `config.${stage}.yml`);

  try {
    // 3. YML 파일 raw string 읽기
    let fileContents = readFileSync(YAML_CONFIG_PATH, 'utf8');

    // 4. 정규식을 통해 ${VARIABLE_NAME} 형태를 process.env.VARIABLE_NAME 값으로 치환
    fileContents = fileContents.replace(/\${(\w+)}/g, (_, envVarName) => {
      const envValue = process.env[envVarName];
      if (envValue === undefined) {
        console.warn(`[Config] 경고: 환경 변수 "${envVarName}"가 정의되지 않았습니다.`);
        return '';
      }
      return envValue;
    });

    // 5. 치환 완료된 문자열을 YAML 객체로 파싱하여 반환
    return yaml.load(fileContents) as Record<string, any>;
  } catch (error) {
    console.error(`설정 파일을 불러오는 데 실패했습니다: ${YAML_CONFIG_PATH}`, error);
    return {};
  }
};