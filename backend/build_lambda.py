#!/usr/bin/env python3
"""
Lambda 배포 패키지 빌드 스크립트
"""
import os
import shutil
import subprocess
import sys

def build_lambda_package():
    """Lambda 배포 패키지를 빌드합니다."""
    
    # 배포 디렉토리 생성
    deploy_dir = "lambda_deploy"
    if os.path.exists(deploy_dir):
        shutil.rmtree(deploy_dir)
    os.makedirs(deploy_dir)
    
    print("📦 Lambda 배포 패키지 빌드 중...")
    
    # 1. Python 패키지 설치
    print("📥 의존성 설치 중...")
    subprocess.run([
        sys.executable, "-m", "pip", "install", 
        "-r", "requirements-lambda.txt", 
        "-t", deploy_dir
    ], check=True)
    
    # 2. 애플리케이션 코드 복사
    print("📁 애플리케이션 코드 복사 중...")
    shutil.copytree("app", os.path.join(deploy_dir, "app"))
    
    # 3. Lambda 핸들러 복사
    shutil.copy("lambda_function.py", deploy_dir)
    
    # 4. ZIP 파일 생성
    print("🗜️ ZIP 파일 생성 중...")
    shutil.make_archive("lambda_deploy", "zip", deploy_dir)
    
    # 5. 정리
    shutil.rmtree(deploy_dir)
    
    print("✅ Lambda 배포 패키지가 생성되었습니다: lambda_deploy.zip")
    print("📊 파일 크기:", os.path.getsize("lambda_deploy.zip"), "bytes")

if __name__ == "__main__":
    build_lambda_package() 