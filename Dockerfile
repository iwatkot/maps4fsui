FROM python:3.11-slim-bullseye

ARG API_TOKEN
ENV API_TOKEN=${API_TOKEN}
ARG STATS_HOST
ENV STATS_HOST=${STATS_HOST}

# Dependencies for opencv and blender.
RUN apt-get update && apt-get install -y \
    libgl1-mesa-dev \
    libglib2.0-0 \ 
    wget \
    tar \
    ca-certificates \
    xz-utils \
    libxrender1 \ 
    libxi6 \
    libxkbcommon0 \ 
    libsm6 \
    libice6 \
    libx11-6 \
    libxext6 \
    libxfixes3 \
    libxxf86vm1 \
    libxrandr2 \
    libxinerama1 \
    libxcursor1 \
    libxcomposite1 \
    libasound2 \
    libpulse0 \
    libopenal1 \
    libsndfile1 \
    libvorbisfile3 \
    libvorbis0a \
    libogg0 \
    libflac8 \
    libtheora0 \
    libjack-jackd2-0 \
    libavcodec58 \
    libavdevice58 \
    libavformat58 \
    libavutil56 \
    libswscale5 \
    libswresample3 \
    libavfilter7 \
    libglew2.1 \
    libopencolorio1v5 \
    libraw20 \
    libtiff5 \
    libjpeg62-turbo \
    libpng16-16 \
    libfreetype6 \
    libfontconfig1 \
    libharfbuzz0b \
    libpugixml1v5 \
    libspnav0 \
    libtinyxml2.6.2v5 \
    libjemalloc2 \
    libjemalloc-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install blender 4.3.0.
RUN wget https://download.blender.org/release/Blender4.3/blender-4.3.0-linux-x64.tar.xz && \
    tar -xvf blender-4.3.0-linux-x64.tar.xz && \
    mv blender-4.3.0-linux-x64 /opt/blender && \
    ln -s /opt/blender/blender /usr/bin/blender && \
    /usr/bin/blender --version

WORKDIR /usr/src/app

# Clone external repo and copy data/docs
RUN git clone --depth 1 https://github.com/iwatkot/maps4fs.git /tmp/maps4fs \
    && cp -r /tmp/maps4fs/data /usr/src/app/data \
    && cp -r /tmp/maps4fs/docs /usr/src/app/docs \
    && rm -rf /tmp/maps4fs

COPY .streamlit /usr/src/app/.streamlit
COPY maps4fsui /usr/src/app/maps4fsui
COPY requirements.txt /usr/src/app/requirements.txt
COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

RUN pip install -r requirements.txt

COPY favicon.png /usr/local/lib/python3.11/site-packages/streamlit/static/favicon.png

RUN sed -i 's|<noscript>.*</noscript>|<noscript>Generate map templates for Farming Simulator from real places in a couple of clicks. Get the realistic terrain, roads, rivers, fields, and more. Completely free and open-source.</noscript>|' /usr/local/lib/python3.11/site-packages/streamlit/static/index.html
RUN sed -i 's|<title>.*</title>|<title>maps4FS</title>|' /usr/local/lib/python3.11/site-packages/streamlit/static/index.html

EXPOSE 8501
EXPOSE 8000

ENV PYTHONPATH .:${PYTHONPATH}
# CMD ["streamlit", "run", "./maps4fsui/ui.py"]
CMD ["/usr/src/app/entrypoint.sh"]
